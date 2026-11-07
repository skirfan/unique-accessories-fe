"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { AdminButton } from "./admin-ui";
export function AdminRefresh({
  label = "Refresh",
  disabled = false,
}: {
  label?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <AdminButton
      variant="secondary"
      disabled={pending || disabled}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw size={13} className={pending ? "ad-spin" : ""} />
      {pending ? "Refreshing…" : label}
    </AdminButton>
  );
}
