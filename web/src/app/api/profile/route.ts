import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentDbUser } from "@/lib/current-user";
import { cleanText, LIMITS, parseImages } from "@/lib/validation";

export async function GET() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: dbUser.id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      profileTitle: true,
      profileBody: true,
      images: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const profileTitle = cleanText(payload?.profileTitle, LIMITS.profileTitle);
  const profileBody = cleanText(payload?.profileBody, LIMITS.profileBody);
  const images = parseImages(payload?.images);
  const userId = dbUser.id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      profileTitle,
      profileBody,
    },
  });

  await prisma.image.deleteMany({
    where: { userId },
  });

  if (images.length > 0) {
    await prisma.image.createMany({
      data: images.map((img) => ({
        url: img.url,
        caption: img.caption || "",
        userId,
      })),
    });
  }

  revalidatePath("/profile");
  revalidatePath(`/users/${userId}`);

  return NextResponse.json({ success: true });
}
