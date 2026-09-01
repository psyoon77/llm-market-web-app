export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";
import Link from "next/link";
import DeleteProductButton from "@/components/DeleteProductButton";

export default async function MyProductsPage() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return <div className="p-4">Please sign in.</div>;
  }

  const products = await prisma.product.findMany({
    where: { ownerId: dbUser.id },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto p-4 sm:p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h1 className="text-2xl md:text-3xl font-bold">My Products</h1>
        <Link
          href="/products/create"
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-green-600 text-white w-full sm:w-auto"
        >
          New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-gray-500">You have no products yet.</div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                {product.images[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].caption || product.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded border bg-gray-100 shrink-0" />
                )}

                <div className="min-w-0">
                  <div className="font-semibold break-words">{product.title}</div>
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-block text-blue-600 underline mt-1"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">
                <Link
                  href={`/products/${product.id}/edit`}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-blue-600 text-white w-full sm:w-auto"
                >
                  Edit Product
                </Link>
                <DeleteProductButton id={product.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
