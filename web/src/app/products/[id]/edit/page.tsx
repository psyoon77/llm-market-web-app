export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditProductForm from "@/components/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect("/login");
  }

  const { id } = await params;
  const productId = Number(id);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product) {
    redirect("/my-products");
  }

  if (product.ownerId !== dbUser.id) {
    redirect(`/products/${productId}`);
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link
          href={`/products/${product.id}`}
          className="text-blue-600 underline"
        >
          Back to Product
        </Link>
      </div>

      <EditProductForm
        productId={product.id}
        initialTitle={product.title}
        initialBody={product.body}
        initialImages={product.images.map((img) => ({
          url: img.url,
          caption: img.caption || "",
        }))}
      />
    </div>
  );
}
