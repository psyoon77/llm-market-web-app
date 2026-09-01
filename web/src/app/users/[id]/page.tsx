export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      profileTitle: true,
      profileBody: true,
      images: true,
      products: {
        where: { isHidden: false },
        include: { images: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">
          {user.name || user.username || "User"}&apos;s Profile
        </h1>

        <p className="text-xl font-semibold text-black mt-3">
          {user.profileTitle || "No profile title yet."}
        </p>

        <p className="mt-2 whitespace-pre-wrap text-gray-700">
          {user.profileBody || "No profile description yet."}
        </p>
      </div>

      {user.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user.images.map((img) => (
            <div key={img.id} className="border rounded p-2">
              <img
                src={img.url}
                alt={img.caption || "Profile image"}
                className="w-full h-auto rounded"
              />
              {img.caption && (
                <p className="mt-2 text-sm text-gray-600">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-3">Products</h2>

        {user.products.length === 0 ? (
          <div className="text-gray-500">No products yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border rounded p-3 block hover:shadow"
              >
                {product.images[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].caption || product.title}
                    className="w-full h-48 object-cover rounded border"
                  />
                ) : (
                  <div className="w-full h-48 rounded border bg-gray-100" />
                )}

                <div className="mt-3 font-semibold text-black">
                  {product.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
