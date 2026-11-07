import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/server-catalog";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES = [
  "",
  "/products",
  "/categories",
  "/about",
  "/contact",
  "/faq",
  "/shipping-returns",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { getAllProducts, getCategories, getSubcategories } =
    await getCatalog();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const subcategoryEntries: MetadataRoute.Sitemap = getSubcategories().map(
    (s) => ({
      url: `${SITE_URL}/category/${s.categorySlug}/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const productEntries: MetadataRoute.Sitemap = getAllProducts().map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...subcategoryEntries,
    ...productEntries,
  ];
}
