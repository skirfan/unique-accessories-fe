"use client";
import { useCatalog } from "@/components/providers/catalog-provider";
import { ProductVisual } from "@/components/product/product-visual";
import { getProductVisual } from "@/lib/product-images";
import type { CartLine } from "@/types";
export function CartProductImage({
  line,
  className,
}: {
  line: CartLine;
  className?: string;
}) {
  const product = useCatalog().getProductBySlug(line.productSlug);
  const current = product
    ? getProductVisual(product, line.variantId)
    : undefined;
  return (
    <ProductVisual
      visual={current?.imageUrl ? current : line.visual}
      label={line.productName}
      className={className}
      iconClassName="h-7 w-7"
    />
  );
}
