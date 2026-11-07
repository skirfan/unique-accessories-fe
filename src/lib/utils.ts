import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product, ProductVariant } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The variant to show/add-to-cart from a product card or listing, where no
 * specific variant has been picked yet — the lowest-priced one. */
export function getCheapestVariant(product: Product): ProductVariant {
  const available = product.variants.filter((v) => v.stock > 0);
  return [...(available.length ? available : product.variants)].sort(
    (a, b) => a.price - b.price,
  )[0];
}

export function getMinVariantPrice(product: Product): number {
  return getCheapestVariant(product).price;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

export function discountPercent(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
