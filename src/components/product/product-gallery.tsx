"use client";
import { useState } from "react";
import type { Product } from "@/types";
import { ProductVisual } from "./product-visual";
import { useProductSelection } from "./product-selection";
import { cn } from "@/lib/utils";
export function ProductGallery({ product }: { product: Product }) {
  const { variantId } = useProductSelection();
  const [selected, setSelected] = useState<{
    variantId: string;
    id: string;
  } | null>(null);
  const images = product.images ?? [];
  const specific = images.filter((i) => i.variantId === variantId);
  const general = images.filter((i) => !i.variantId);
  const shown = specific.length
    ? [...specific, ...general]
    : general.length
      ? general
      : images;
  const current =
    shown.find(
      (i) => selected?.variantId === variantId && i.id === selected.id,
    ) ?? shown[0];
  return (
    <div
      className={cn(
        "premium-product-gallery",
        shown.length > 1 && "has-thumbnails",
      )}
    >
      <ProductVisual
        visual={{
          ...product.visual,
          imageUrl: current?.url ?? product.visual.imageUrl,
        }}
        label={current?.altText || product.name}
        className="premium-gallery-main aspect-square w-full"
        iconClassName="h-20 w-20 md:h-24 md:w-24"
        priority
      />
      {shown.length > 1 && (
        <div className="premium-gallery-thumbnails">
          {shown.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setSelected({ variantId, id: image.id })}
              aria-label={`Show product photo ${index + 1}`}
              aria-current={current?.id === image.id}
              className={cn(
                "w-20 shrink-0 overflow-hidden rounded-xl border-2",
                current?.id === image.id
                  ? "border-accent-500"
                  : "border-navy-100",
              )}
            >
              <ProductVisual
                visual={{
                  ...product.visual,
                  imageUrl: image.thumbnailUrl ?? image.url,
                }}
                label={image.altText || `${product.name} photo ${index + 1}`}
                className="aspect-square w-full rounded-none"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
