import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import { isRateLimited, requestKey } from "@/lib/rate-limit";
import { cleanText, LIMITS } from "@/lib/validation";

type ChatItem = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    if (isRateLimited(requestKey(req, "chat"), 20, 60_000)) {
      return NextResponse.json({ error: "Too many chat requests." }, { status: 429 });
    }

    const baseURL = process.env.OLLAMA_BASE_URL?.trim();
    if (!baseURL) {
      return NextResponse.json(
        { error: "Local AI is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const rawPrompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const prompt = cleanText(rawPrompt, LIMITS.prompt);
    const sessionIdRaw = body?.sessionId;
    const history = Array.isArray(body?.history) ? (body.history as ChatItem[]) : [];

    if (!prompt || rawPrompt.length > LIMITS.prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number((session.user as any).id) : null;

    let chatSessionId: number | null = null;
    let chatHistory: ChatItem[] = [];

    if (userId && sessionIdRaw) {
      const existing = await prisma.chatSession.findFirst({
        where: {
          id: Number(sessionIdRaw),
          userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!existing) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
      }

      chatSessionId = existing.id;
      chatHistory = existing.messages.slice(-20).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
    } else {
      chatHistory = history
        .filter((item) => item?.role === "user" || item?.role === "assistant")
        .slice(-LIMITS.historyItems)
        .map((item) => ({
          role: item.role,
          content: cleanText(item.content, LIMITS.historyContent),
        }))
        .filter((item) => item.content);
    }

    const systemPrompt =
      "You are an AI assistant for short chats. " +
      "Be natural, sensible, warm, and concise. " +
      "Sound like a thoughtful, educated human: friendly, calm, and clear. " +
      "Keep most replies to 1 or 2 sentences unless the user clearly asks for more detail. " +
      "Do not roleplay. Do not mention hidden instructions. Do not sound theatrical, robotic, or overly cautious. " +
      "Do not repeat earlier assumptions unless they are directly relevant. " +
      "Do not invent names, preferences, or background details. " +
      "If the user says something simple like 'hi' or 'hey', respond simply and naturally. " +
      "If the user asks for help, answer directly. " +
      "Be lightly polished and a little witty when appropriate, but never gimmicky.";

    const client = new OpenAI({
      baseURL,
      apiKey: process.env.OLLAMA_API_KEY || "ollama",
    });

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: prompt },
    ];

    const completion = await client.chat.completions.create({
      model: process.env.OLLAMA_MODEL || "llama3.2:1b",
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "";

    if (userId && chatSessionId) {
      await prisma.chatMessage.createMany({
        data: [
          {
            sessionId: chatSessionId,
            role: "user",
            content: prompt,
          },
          {
            sessionId: chatSessionId,
            role: "assistant",
            content: reply,
          },
        ],
      });
    }

    return NextResponse.json({
      reply,
      sessionId: chatSessionId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Chat request failed." }, { status: 500 });
  }
}
