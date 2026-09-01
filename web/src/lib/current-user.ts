import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCurrentDbUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const email = session.user.email || undefined;
  const username = (session.user as any).username || undefined;

  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (byEmail) return byEmail;
  }

  if (username) {
    const byUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (byUsername) return byUsername;
  }

  return null;
}
