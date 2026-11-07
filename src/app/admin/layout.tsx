import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@mantine/core/styles.layer.css";
import { AdminProvider } from "@/components/admin/admin-provider";
import "./admin.css";
import "./classic.css";
export const metadata: Metadata = {
  title: { default: "Overview · Unique Admin", template: "%s · Unique Admin" },
  description: "Unique Accessories store management",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preferences = await cookies();
  const initialScheme =
    preferences.get("ua_admin_theme")?.value === "dark" ? "dark" : "light";
  return (
    <AdminProvider
      initialScheme={initialScheme}
      initialCollapsed={
        preferences.get("ua_admin_sidebar")?.value === "collapsed"
      }
    >
      {children}
    </AdminProvider>
  );
}
