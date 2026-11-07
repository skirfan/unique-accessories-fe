import type { Metadata } from "next";
import { adminServerApi } from "@/lib/admin-server";
import { AdminTaxonomy } from "@/components/admin/admin-taxonomy";
import type { Taxonomy } from "@/types/catalog-admin";
export const metadata: Metadata = { title: "Categories & devices" };
export default async function CatalogPage() {
  return (
    <AdminTaxonomy
      taxonomy={await adminServerApi<Taxonomy>("/admin/catalog/taxonomy")}
    />
  );
}
