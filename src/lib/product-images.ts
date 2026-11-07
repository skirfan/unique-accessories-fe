import type { Product, ProductVisual } from "@/types";
/** Prefer the selected variant's admin photo, then the shared cover, then any photo. */
export function getProductVisual(
  product: Product,
  variantId?: string,
  fullSize = false,
): ProductVisual {
  const images = product.images ?? [];
  const photo =
    (variantId
      ? images.find((image) => image.variantId === variantId)
      : undefined) ??
    images.find((image) => !image.variantId) ??
    images[0];
  return {
    ...product.visual,
    imageUrl: photo
      ? fullSize
        ? photo.url
        : photo.thumbnailUrl || photo.url
      : product.visual.imageUrl,
  };
}
