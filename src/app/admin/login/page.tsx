import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-server";
import { AdminLogin } from "@/components/admin/admin-login";
export const metadata: Metadata = { title: "Sign in" };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  if (await getAdminSession()) redirect("/admin");
  const { expired } = await searchParams;
  return <AdminLogin expired={expired === "1"} />;
}
