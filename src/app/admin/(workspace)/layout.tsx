import { requireAdminSession } from "@/lib/admin-server";
import { AdminShell } from "@/components/admin/admin-shell";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
