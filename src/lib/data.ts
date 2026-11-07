import type {
  Brand,
  Category,
  Coupon,
  DeviceModel,
  DeviceType,
  Product,
  Subcategory,
} from "@/types";
import { getMinVariantPrice } from "@/lib/utils";

import type { PublicStoreSettings } from "@/types/commerce";

export interface ProductFilters {
  categorySlug?: string;
  subcategorySlug?: string | string[];
  deviceModelId?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  badge?: string;
  sort?: "relevance" | "price-asc" | "price-desc" | "rating" | "newest";
}

export interface CatalogSnapshot {
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  deviceModels: DeviceModel[];
  products: Product[];
  coupons: Coupon[];
  settings: PublicStoreSettings;
}

export function createCatalog(snapshot: CatalogSnapshot) {
  const { categories, subcategories, brands, deviceModels, products, coupons } =
    snapshot;
  function getCategories(): Category[] {
    return categories;
  }

  function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find((c) => c.slug === slug);
  }

  function getSubcategories(categorySlug?: string): Subcategory[] {
    if (!categorySlug) return subcategories;
    return subcategories.filter((s) => s.categorySlug === categorySlug);
  }

  function getSubcategoryBySlug(slug: string): Subcategory | undefined {
    return subcategories.find((s) => s.slug === slug);
  }

  function getBrands(type?: DeviceType): Brand[] {
    if (!type) return brands;
    return brands.filter((b) => b.type === type);
  }

  function getDeviceModels(type?: DeviceType): DeviceModel[] {
    if (!type) return deviceModels;
    return deviceModels.filter((d) => d.type === type);
  }

  function getDeviceModelById(id: string): DeviceModel | undefined {
    return deviceModels.find((d) => d.id === id);
  }

  function getDeviceModelsByBrand(brandId: string): DeviceModel[] {
    return deviceModels.filter((d) => d.brandId === brandId);
  }

  function getAllProducts(): Product[] {
    return products;
  }

  function getProducts(filters: ProductFilters = {}): Product[] {
    let result = [...products];

    if (filters.categorySlug) {
      result = result.filter((p) => p.categorySlug === filters.categorySlug);
    }

    if (filters.subcategorySlug) {
      const slugs = Array.isArray(filters.subcategorySlug)
        ? filters.subcategorySlug
        : [filters.subcategorySlug];
      result = result.filter((p) => slugs.includes(p.subcategorySlug));
    }

    if (filters.deviceModelId) {
      result = result.filter(
        (p) =>
          p.compatibleDeviceModelIds.length === 0 ||
          p.compatibleDeviceModelIds.includes(filters.deviceModelId!),
      );
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (typeof filters.minPrice === "number") {
      result = result.filter((p) => getMinVariantPrice(p) >= filters.minPrice!);
    }

    if (typeof filters.maxPrice === "number") {
      result = result.filter((p) => getMinVariantPrice(p) <= filters.maxPrice!);
    }

    if (filters.badge) {
      result = result.filter((p) => p.badge === filters.badge);
    }

    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => getMinVariantPrice(a) - getMinVariantPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => getMinVariantPrice(b) - getMinVariantPrice(a));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) => (a.badge === "New" ? -1 : 0) - (b.badge === "New" ? -1 : 0),
        );
        break;
      default:
        break;
    }

    return result;
  }

  function getProductBySlug(slug: string): Product | undefined {
    return products.find((p) => p.slug === slug);
  }

  function getRelatedProducts(product: Product, limit = 4): Product[] {
    return products
      .filter(
        (p) =>
          p.id !== product.id && p.subcategorySlug === product.subcategorySlug,
      )
      .slice(0, limit);
  }

  function getFeaturedProducts(limit = 8): Product[] {
    return products.filter((p) => p.badge === "Bestseller").slice(0, limit);
  }

  function getNewArrivals(limit = 8): Product[] {
    return products.filter((p) => p.badge === "New").slice(0, limit);
  }

  function getDealsProducts(limit = 8): Product[] {
    return products
      .filter(
        (p) => p.badge === "Sale" || p.variants.some((v) => v.compareAtPrice),
      )
      .slice(0, limit);
  }

  function getPriceRange(list: Product[] = products): {
    min: number;
    max: number;
  } {
    if (list.length === 0) return { min: 0, max: 0 };
    const prices = list.map(getMinVariantPrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }

  function getCoupons(): Coupon[] {
    return coupons;
  }

  function getCouponByCode(code: string): Coupon | undefined {
    return coupons.find(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase(),
    );
  }

  function findVariant(productId: string, variantId: string) {
    const product = products.find((p) => p.id === productId);
    return product?.variants.find((v) => v.id === variantId);
  }

  return {
    getCategories,
    getCategoryBySlug,
    getSubcategories,
    getSubcategoryBySlug,
    getBrands,
    getDeviceModels,
    getDeviceModelById,
    getDeviceModelsByBrand,
    getAllProducts,
    getProducts,
    getProductBySlug,
    getRelatedProducts,
    getFeaturedProducts,
    getNewArrivals,
    getDealsProducts,
    getPriceRange,
    getCoupons,
    getCouponByCode,
    findVariant,
    settings: snapshot.settings,
  };
}
