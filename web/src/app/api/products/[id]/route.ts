import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentDbUser } from "@/lib/current-user";
import { cleanText, LIMITS, parseImages } from "@/lib/validation";

const publicOwner = {
  id: true,
  name: true,
  username: true,
} as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const productId = Number(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product does not exist" },
        { status: 404 }
      );
    }

    const isOwner = product.ownerId === dbUser.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the owner can edit this product" },
        { status: 403 }
      );
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

    await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        body,
      },
    });

    await prisma.image.deleteMany({
      where: { productId },
    });

    if (safeImages.length > 0) {
      await prisma.image.createMany({
        data: safeImages.map((img) => ({
          url: img.url,
          caption: img.caption,
          productId,
        })),
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        owner: { select: publicOwner },
        images: true,
      },
    });

    revalidatePath("/products");
    revalidatePath("/my-products");
    revalidatePath(`/products/${productId}`);
    revalidatePath(`/users/${product.ownerId}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const productId = Number(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product does not exist" },
        { status: 404 }
      );
    }

    const isOwner = product.ownerId === dbUser.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.image.deleteMany({
      where: { productId },
    });

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/products");
    revalidatePath("/my-products");
    revalidatePath(`/products/${productId}`);
    revalidatePath(`/users/${product.ownerId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
