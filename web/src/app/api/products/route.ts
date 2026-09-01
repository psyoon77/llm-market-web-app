import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";
import { cleanText, LIMITS, parseImages } from "@/lib/validation";

const publicOwner = {
  id: true,
  name: true,
  username: true,
} as const;

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isHidden: false },
    include: {
      owner: { select: publicOwner },
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await req.json();
  const title = cleanText(payload?.title, LIMITS.title);
  const body = cleanText(payload?.body, LIMITS.body);

  if (!title || !body) {
    return NextResponse.json(
      { error: "Title and body are required" },
      { status: 400 }
    );
  }

  const safeImages = parseImages(payload?.images);

  const product = await prisma.product.create({
    data: {
      title,
      body,
      ownerId: dbUser.id,
      isHidden: false,
      images: {
        create: safeImages,
      },
    },
    include: {
      images: true,
      owner: { select: publicOwner },
    },
  });

  return NextResponse.json(product, { status: 201 });
}
