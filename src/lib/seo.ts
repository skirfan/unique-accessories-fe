import { getCheapestVariant } from "@/lib/utils";
import type { Product } from "@/types";

export const SITE_NAME = "Unique Accessories";

// Swap NEXT_PUBLIC_SITE_URL to the real production domain before deploy
// (see doc/phases/13-deployment-devops.md). Falls back to localhost for dev.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function productJsonLd(product: Product) {
  const cheapest = getCheapestVariant(product);
  const inStock = product.variants.some((v) => v.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images?.map((image) => new URL(image.url, SITE_URL).href),
    sku: cheapest.sku,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "INR",
      price: cheapest.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function breadcrumbJsonLd(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}
