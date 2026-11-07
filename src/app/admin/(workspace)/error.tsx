"use client";
import { AlertCircle } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-ui";
export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <section className="ad-card ad-empty">
      <AlertCircle size={30} />
      <h2>Store data is temporarily unavailable.</h2>
      <p>Your changes have not been submitted. Try loading this page again.</p>
      <AdminButton onClick={reset}>Try again</AdminButton>
    </section>
  );
}
