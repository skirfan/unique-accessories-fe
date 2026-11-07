import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-server";
export default async function MissingAdminPage() {
  await requireAdminSession();
  notFound();
}
