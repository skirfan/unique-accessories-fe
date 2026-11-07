import type { z } from "zod";
import type { productSchema } from "@/lib/validation/catalog";
import type { Brand, Category, Subcategory, DeviceModel } from "@/types";
export interface Taxonomy {
  categories: Category[];
  subcategories: (Subcategory & { category: Category })[];
  brands: Brand[];
  deviceModels: (DeviceModel & { brand: Brand })[];
}
export interface Inventory {
  quantity: number;
  reserved: number;
  version: number;
}
export interface CatalogImage {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  variantId: string | null;
  position: number;
}
export type ProductInput = z.infer<typeof productSchema>;
export interface AdminProduct extends Omit<ProductInput, "variants"> {
  id: string;
  version: number;
  updatedAt: string;
  subcategory: Subcategory & { category: Category };
  images: CatalogImage[];
  variants: (ProductInput["variants"][number] & {
    id: string;
    inventory: Inventory | null;
  })[];
}
export interface ProductList {
  products: AdminProduct[];
  total: number;
  page: number;
  pages: number;
}
export interface InventoryRow {
  id: string;
  sku: string;
  color: string | null;
  material: string | null;
  capacity: string | null;
  isActive: boolean;
  available: number;
  product: { id: string; name: string; status: string };
  inventory: Inventory | null;
}
export interface InventoryList {
  items: InventoryRow[];
  total: number;
  page: number;
  pages: number;
  lowStockCount: number;
}
export interface StockMovement {
  id: string;
  variantId: string;
  delta: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  actor: string;
  orderReference: string | null;
  createdAt: string;
}
