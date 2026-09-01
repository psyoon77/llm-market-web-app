import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number((session.user as any).id) : null;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const chatId = Number(id);

  if (!Number.isFinite(chatId)) {
    return NextResponse.json({ error: "Invalid chat id." }, { status: 400 });
  }

  const existing = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { slot: "asc" },
  });

  if (existing.length <= 1) {
    return NextResponse.json(
      { error: "At least one chat must remain." },
      { status: 400 }
    );
  }

  const target = existing.find((s) => s.id === chatId);

  if (!target) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  await prisma.chatSession.delete({
    where: { id: chatId },
  });

  return NextResponse.json({ success: true });
}
