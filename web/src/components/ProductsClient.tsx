"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

export type ProductsClientProduct = {
  id: number;
  title: string;
  images: { id: number; url: string; caption?: string | null }[];
  owner: {
    id: number;
    name?: string | null;
    username?: string | null;
  };
};

function matchesWordPrefix(title: string, query: string) {
  const queryWords = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (queryWords.length === 0) return true;

  const words = title
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return queryWords.every((queryWord) =>
    words.some((word) => word.startsWith(queryWord))
  );
}

export default function ProductsClient({
  initialProducts,
}: {
  initialProducts: ProductsClientProduct[];
}) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => matchesWordPrefix(p.title, query));
  }, [initialProducts, query]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Products</h1>

        {session?.user && (
          <Link
            href="/products/create"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Product
          </Link>
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter product title to search"
        className="w-full border rounded p-3"
      />

      {filtered.length === 0 ? (
        <div className="text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const sellerName =
              product.owner.name ??
              product.owner.username ??
              "User";

            return (
              <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
                <Link
                  href={`/products/${product.id}`}
                  className="block text-xl font-semibold hover:underline"
                >
                  {product.title}
                </Link>

                {product.images[0] ? (
                  <Link href={`/products/${product.id}`} className="block">
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].caption || product.title}
                      className="w-full h-56 object-cover rounded border"
                      loading="lazy"
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/products/${product.id}`}
                    className="block w-full h-56 rounded border bg-gray-100"
                  />
                )}

                <p className="text-sm text-gray-500">
                  Seller:{" "}
                  <Link
                    href={session?.user ? `/users/${product.owner.id}` : "/login"}
                    className="text-blue-600 underline"
                  >
                    {sellerName}
                  </Link>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
