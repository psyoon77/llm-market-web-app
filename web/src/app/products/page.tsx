import { prisma } from "@/lib/prisma";
import ProductsClient from "@/components/ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isHidden: false },
    include: {
      owner: {
        select: { id: true, name: true, username: true },
      },
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <ProductsClient initialProducts={products} />;
}
