import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";
import type { Product } from "@/types";

export function ProductGrid({
  products,
  columns = 4,
}: {
  products: Product[];
  columns?: 3 | 4;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        description="Try adjusting your filters or browse our full catalog instead."
        actionLabel="View all products"
        actionHref="/products"
      />
    );
  }

  return (
    <div
      className={`premium-product-grid grid grid-cols-2 gap-3 md:grid-cols-3 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} sm:gap-5 md:gap-6}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
