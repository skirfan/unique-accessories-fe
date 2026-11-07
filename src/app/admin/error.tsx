"use client";
import { AlertCircle } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-ui";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="ad-error-page">
      <div className="ad-empty">
        <AlertCircle size={32} />
        <h1>We couldn’t load your workspace.</h1>
        <p>Please check that the store API is running, then try again.</p>
        <AdminButton onClick={reset}>Try again</AdminButton>
      </div>
    </div>
  );
}
