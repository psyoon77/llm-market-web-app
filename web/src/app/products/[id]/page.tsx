export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import DeleteProductButton from "@/components/DeleteProductButton";
import Link from "next/link";

const IMAGE_FRAME_CLASS =
  "border rounded p-2 h-64 sm:h-72 flex items-center justify-center bg-gray-50 overflow-hidden";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect("/login");
  }

  const { id: rawId } = await params;
  const id = Number(rawId);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, username: true },
      },
      images: true,
    },
  });

  if (!product || product.isHidden) {
    redirect("/products");
  }

  const isOwner = dbUser.id === product.ownerId;
  const updatedAtValue =
    typeof product.updatedAt?.toISOString === "function"
      ? product.updatedAt.toISOString()
      : String(product.updatedAt);

  return (
    <div className="container mx-auto p-4 sm:p-5 md:p-6 space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold break-words">
          {product.title}
        </h1>
        <p className="whitespace-pre-wrap text-gray-800 break-words">
          {product.body}
        </p>
      </div>

      {product.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {product.images.map((img) => {
            const src = img.url.startsWith("data:")
              ? img.url
              : `${img.url}?v=${encodeURIComponent(updatedAtValue)}-${img.id}`;

            return (
              <div key={img.id} className="border rounded p-2 sm:p-3 flex flex-col gap-3">
                <div className={IMAGE_FRAME_CLASS}>
                  <img
                    src={src}
                    alt={img.caption || product.title}
                    className="max-h-full max-w-full object-contain rounded"
                    loading="lazy"
                  />
                </div>

                <div className="min-h-[24px]">
                  {img.caption && (
                    <p className="text-sm text-gray-600 break-words">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-sm text-gray-500 break-words">
        Seller:{" "}
        <Link
          href={`/users/${product.owner.id}`}
          className="text-blue-600 underline"
        >
          {product.owner.name ??
            product.owner.username ??
            "User"}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {isOwner && (
          <Link
            href={`/products/${product.id}/edit`}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-blue-600 text-white w-full sm:w-auto"
          >
            Edit Product
          </Link>
        )}

        {isOwner && (
          <DeleteProductButton id={product.id} />
        )}
      </div>
    </div>
  );
}
