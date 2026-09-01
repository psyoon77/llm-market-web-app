import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionIdParam = searchParams.get("sessionId");

  if (!sessionIdParam) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number((session.user as any).id) : null;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id: Number(sessionIdParam),
      userId,
    },
  });

  if (!chatSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId: chatSession.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
  );
}
