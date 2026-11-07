import type { Metadata } from "next";
import { adminServerApi } from "@/lib/admin-server";
import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import type { AdminProduct, Taxonomy } from "@/types/catalog-admin";
export const metadata: Metadata = { title: "Edit product" };
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, taxonomy] = await Promise.all([
    adminServerApi<AdminProduct>(`/admin/products/${encodeURIComponent(id)}`),
    adminServerApi<Taxonomy>("/admin/catalog/taxonomy"),
  ]);
  return (
    <AdminProductEditor
      key={product.id}
      initial={product}
      taxonomy={taxonomy}
    />
  );
}
