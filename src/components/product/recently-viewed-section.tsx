"use client";

import { ProductSection } from "@/components/home/product-section";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";

/** "Recently Viewed" strip, reading from localStorage — excludes
 * `excludeProductId` (the product currently being viewed, if any). */
export function RecentlyViewedSection({
  excludeProductId,
}: {
  excludeProductId?: string;
}) {
  const { getAllProducts } = useCatalog();
  const mounted = useHasMounted();
  const productIds = useRecentlyViewedStore((s) => s.productIds);

  if (!mounted) return null;

  const ids = productIds.filter((id) => id !== excludeProductId);
  if (ids.length === 0) return null;

  const byId = new Map(getAllProducts().map((p) => [p.id, p]));
  const products = ids.map((id) => byId.get(id)).filter((p) => p !== undefined);
  if (products.length === 0) return null;

  return (
    <ProductSection
      eyebrow="Your history"
      title="Recently Viewed"
      viewAllHref="/products"
      products={products}
    />
  );
}
