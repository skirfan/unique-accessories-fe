export type DeviceType = "PHONE" | "CAR";

export type VisualTheme = "navy" | "orange" | "teal" | "slate" | "plum";

export interface ProductVisual {
  imageUrl?: string;
  icon: string;
  theme: VisualTheme;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Brand {
  id: string;
  name: string;
  type: DeviceType;
}

export interface DeviceModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  type: DeviceType;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color?: string;
  colorHex?: string;
  material?: string;
  capacity?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export type ProductBadge = "Bestseller" | "New" | "Sale" | null;

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subcategoryId: string;
  subcategorySlug: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  badge: ProductBadge;
  visual: ProductVisual;
  variants: ProductVariant[];
  compatibleDeviceModelIds: string[];
  images?: {
    id: string;
    url: string;
    thumbnailUrl?: string | null;
    altText?: string | null;
    variantId?: string | null;
  }[];
  reviews: ProductReview[];
}

export interface Coupon {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderValue: number;
  description: string;
}

export interface CartLine {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  visual: ProductVisual;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  stock: number;
}
