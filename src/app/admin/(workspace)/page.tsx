import type { Metadata } from "next";
import type { AdminOverview as Overview } from "@/types/admin";
import { adminServerApi } from "@/lib/admin-server";
import { AdminOverview } from "@/components/admin/admin-overview";
export const metadata: Metadata = { title: "Dashboard" };
export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const days = ["7", "30", "180", "365"].includes(query.days as string)
    ? (query.days as string)
    : "30";
  return (
    <AdminOverview
      data={await adminServerApi<Overview>(`/admin/overview?days=${days}`)}
    />
  );
}
