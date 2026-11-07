"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
export function AdminIntegrations() {
  const [state, setState] = useState<{
      shiprocket: boolean;
      google: boolean;
      pickupLocation: string | null;
    } | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    adminApi<NonNullable<typeof state>>("/admin/integrations")
      .then((s) => {
        if (active) setState(s);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="ad-card">
      <div className="ad-card-heading">
        <div>
          <h2>Connected services</h2>
          <p>
            Credentials stay on the backend. Restart it after changing its
            environment.
          </p>
        </div>
      </div>
      <div className="ad-detail-body" style={{ display: "grid", gap: 15 }}>
        {error ? (
          <p role="alert" className="ad-alert ad-alert--error">
            {error}
          </p>
        ) : !state ? (
          <p>Checking integrations…</p>
        ) : (
          <>
            <p>
              <strong>Google customer login:</strong>{" "}
              {state.google ? "Configured" : "Not configured"}
            </p>
            <p>
              <strong>Shiprocket:</strong>{" "}
              {state.shiprocket
                ? `Configured · pickup: ${state.pickupLocation}`
                : "Not configured"}
            </p>
            <p className="ad-small-label">
              Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI
              for Google login. Set SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD,
              SHIPROCKET_PICKUP_LOCATION and SHIPROCKET_WEBHOOK_TOKEN for
              shipping. These indicate configuration only; complete a provider
              test before launch.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
