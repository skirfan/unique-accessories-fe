"use client";
import Image from "next/image";
import { AdminButton } from "./admin-ui";
import { useRef, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { StoreSettings } from "@/types/commerce";

export function AdminInvoiceLogo({
  settings,
  onUpdated,
  disabled,
  onBusyChange,
}: {
  settings: StoreSettings;
  disabled: boolean;
  onBusyChange: (value: boolean) => void;
  onUpdated: (value: StoreSettings) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function update(file?: File) {
    setError("");
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Choose an image up to 2 MB.");
      return;
    }
    setBusy(true);
    onBusyChange(true);
    try {
      const body = new FormData();
      if (file) body.append("logo", file);
      const result = await adminApi<StoreSettings>(
        `/admin/settings/invoice-logo${file ? `?version=${settings.version}` : ""}`,
        {
          method: file ? "POST" : "DELETE",
          body: file ? body : JSON.stringify({ version: settings.version }),
        },
      );
      onUpdated(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update invoice logo.",
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <strong>Invoice logo</strong>
      <div
        style={{
          background: "white",
          border: "1px solid #dce2eb",
          borderRadius: 12,
          padding: 16,
          maxWidth: 380,
        }}
      >
        <Image
          unoptimized
          src={settings.invoiceLogoImage || "/brand/logo-header.png"}
          width={340}
          height={110}
          style={{ width: "100%", height: 110, objectFit: "contain" }}
          alt="Invoice logo preview"
        />
      </div>
      <p className="ad-small-label">
        Upload a wide PNG, JPEG or WebP up to 2 MB. Transparent PNG works best.
        Logo changes are saved immediately; existing invoices keep their
        branding.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <input
          ref={input}
          hidden
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Upload invoice logo"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void update(file);
          }}
        />
        <AdminButton
          variant="secondary"
          type="button"
          disabled={busy || disabled}
          onClick={() => input.current?.click()}
        >
          {busy
            ? "Updating…"
            : settings.invoiceLogoImage
              ? "Replace logo"
              : "Upload logo"}
        </AdminButton>
        {settings.invoiceLogoImage && (
          <AdminButton
            variant="secondary"
            type="button"
            disabled={busy || disabled}
            onClick={() => void update()}
          >
            Use default logo
          </AdminButton>
        )}
      </div>
      {error && (
        <p role="alert" style={{ color: "#be3455" }}>
          {error}
        </p>
      )}
    </div>
  );
}
