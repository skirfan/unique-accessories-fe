import type { Metadata } from "next";
import type { StoreSettings } from "@/types/commerce";
import { adminServerApi } from "@/lib/admin-server";
import { AdminSettings } from "@/components/admin/admin-settings";
export const metadata: Metadata = { title: "Store settings" };
export default async function SettingsPage() {
  return (
    <AdminSettings
      initial={await adminServerApi<StoreSettings>("/admin/settings")}
    />
  );
}
