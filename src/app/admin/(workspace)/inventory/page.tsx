import type { Metadata } from "next";
import { adminServerApi } from "@/lib/admin-server";
import { readAdminQuery } from "@/lib/admin-query";
import { AdminInventory } from "@/components/admin/admin-inventory";
import type { InventoryList } from "@/types/catalog-admin";
export const metadata: Metadata = { title: "Inventory" };
export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { text, page } = readAdminQuery(await searchParams);
  const query = {
    q: text("q"),
    lowStock: text("lowStock") === "true" ? "true" : "false",
    threshold: String(
      Math.max(0, Math.min(10000, parseInt(text("threshold") || "5", 10) || 0)),
    ),
  };
  const params = new URLSearchParams({ ...query, page: String(page) });
  return (
    <AdminInventory
      key={params.toString()}
      query={query}
      data={await adminServerApi<InventoryList>(`/admin/inventory?${params}`)}
    />
  );
}
