import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_ACTIVE_CHATS = 5;

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number((session.user as any).id) : null;

  if (!userId) {
    return NextResponse.json([]);
  }

  let sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { slot: "asc" },
  });

  if (sessions.length === 0) {
    const created = await prisma.chatSession.create({
      data: {
        userId,
        slot: 1,
      },
    });
    sessions = [created];
  }

  return NextResponse.json(
    sessions.map((s) => ({
      id: s.id,
      slot: s.slot,
      createdAt: s.createdAt,
    }))
  );
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number((session.user as any).id) : null;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const existing = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { slot: "asc" },
  });

  if (existing.length >= MAX_ACTIVE_CHATS) {
    return NextResponse.json(
      { error: "Maximum of 5 active chats reached." },
      { status: 400 }
    );
  }

  const maxSlot = existing.length > 0 ? Math.max(...existing.map((s) => s.slot)) : 0;

  const created = await prisma.chatSession.create({
    data: {
      userId,
      slot: maxSlot + 1,
    },
  });

  return NextResponse.json({
    id: created.id,
    slot: created.slot,
    createdAt: created.createdAt,
  });
}
