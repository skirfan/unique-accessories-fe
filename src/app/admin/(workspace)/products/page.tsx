import type { Metadata } from "next";
import { adminServerApi } from "@/lib/admin-server";
import { readAdminQuery } from "@/lib/admin-query";
import { AdminProducts } from "@/components/admin/admin-products";
import type { ProductList, Taxonomy } from "@/types/catalog-admin";
export const metadata: Metadata = { title: "Products" };
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { text, page } = readAdminQuery(await searchParams);
  const query = {
    q: text("q"),
    status: ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(text("status"))
      ? text("status")
      : "",
    subcategoryId: text("subcategoryId"),
  };
  const params = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(query))
    if (value) params.set(key, value);
  const [data, taxonomy] = await Promise.all([
    adminServerApi<ProductList>(`/admin/products?${params}`),
    adminServerApi<Taxonomy>("/admin/catalog/taxonomy"),
  ]);
  return (
    <AdminProducts
      key={params.toString()}
      data={data}
      taxonomy={taxonomy}
      query={query}
    />
  );
}
