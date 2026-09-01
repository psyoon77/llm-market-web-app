"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteProductButton({ id }: { id: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Failed to delete product");
        return;
      }

      if (pathname?.startsWith("/products/")) {
        router.replace("/my-products");
        router.refresh();
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1 border rounded text-red-600 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
