import type { Metadata } from "next";
import { adminServerApi } from "@/lib/admin-server";
import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import type { Taxonomy } from "@/types/catalog-admin";
export const metadata: Metadata = { title: "Add product" };
export default async function NewProductPage() {
  return (
    <AdminProductEditor
      taxonomy={await adminServerApi<Taxonomy>("/admin/catalog/taxonomy")}
    />
  );
}
