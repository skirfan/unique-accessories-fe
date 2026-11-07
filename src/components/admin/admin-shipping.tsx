"use client";
import { useEffect, useState } from "react";
import { Truck, Download, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import type { Order } from "@/types/commerce";
import { AdminButton, AdminField } from "./admin-ui";
type Shipment = {
  state: string;
  externalOrderId: number | null;
  externalShipmentId: number | null;
  awb: string | null;
  courierName: string | null;
  labelUrl: string | null;
  manifestUrl: string | null;
  pickupScheduled: boolean;
  error: string | null;
};
export function AdminShipping({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: (o: Order) => void;
}) {
  const [shipment, setShipment] = useState<Shipment | null>(null),
    [configured, setConfigured] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const path = `/admin/orders/${order.reference}/shipment`;
  useEffect(() => {
    let active = true;
    Promise.all([
      adminApi<Shipment | null>(path),
      adminApi<{ shiprocket: boolean }>("/admin/integrations"),
    ])
      .then(([s, i]) => {
        if (active) {
          setShipment(s);
          setConfigured(i.shiprocket);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [path, order.status, order.shipment?.state]);
  async function perform(action: string, courierId?: number) {
    setBusy(true);
    setError("");
    try {
      const r = await adminApi<{ order: Order; shipment: Shipment }>(
        `${path}/action`,
        {
          method: "POST",
          body: JSON.stringify({ action, ...(courierId ? { courierId } : {}) }),
        },
      );
      setShipment(r.shipment);
      onUpdated(r.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Shiprocket action failed.");
    } finally {
      setBusy(false);
    }
  }
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await adminApi<Order>(path, {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(
            ["length", "breadth", "height", "weight"].map((k) => [
              k,
              Number(data.get(k)),
            ]),
          ),
        ),
      });
      onUpdated(r);
      setShipment(await adminApi<Shipment | null>(path));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create shipment.");
      setShipment(await adminApi<Shipment | null>(path).catch(() => null));
    } finally {
      setBusy(false);
    }
  }
  const ready =
    ["CONFIRMED", "PACKED"].includes(order.status) &&
    (order.paymentMethod === "COD" || order.paymentStatus === "PAID");
  return (
    <section className="ad-card">
      <div className="ad-card-heading">
        <div>
          <h2>Shiprocket shipping</h2>
          <p>Prepare your parcel, then book and track it.</p>
        </div>
        <Truck size={18} />
      </div>
      <div className="ad-detail-body" style={{ display: "grid", gap: 15 }}>
        {loading ? (
          <p>Loading shipping…</p>
        ) : (
          <>
            {!configured && (
              <p className="ad-alert">
                Add the Shiprocket API email, password and pickup location in
                the backend environment to enable booking.
              </p>
            )}
            {shipment ? (
              <>
                <dl className="ad-shipping-facts">
                  <div>
                    <dt>Status</dt>
                    <dd>{shipment.state.replaceAll("_", " ")}</dd>
                  </div>
                  {shipment.externalOrderId && (
                    <div>
                      <dt>Shiprocket order</dt>
                      <dd>{shipment.externalOrderId}</dd>
                    </div>
                  )}
                  {shipment.externalShipmentId && (
                    <div>
                      <dt>Shipment</dt>
                      <dd>{shipment.externalShipmentId}</dd>
                    </div>
                  )}
                  {shipment.awb && (
                    <div>
                      <dt>AWB</dt>
                      <dd>{shipment.awb}</dd>
                    </div>
                  )}
                  {shipment.courierName && (
                    <div>
                      <dt>Courier</dt>
                      <dd>{shipment.courierName}</dd>
                    </div>
                  )}
                </dl>
                {shipment.error && (
                  <p className="ad-alert ad-alert--error">{shipment.error}</p>
                )}
                {["CREATING", "RECONCILIATION_REQUIRED", "FAILED"].includes(
                  shipment.state,
                ) ? (
                  <>
                    <p className="ad-small-label">
                      If the order exists in Shiprocket, enter its numeric order
                      ID to reconcile it. The provider order reference must
                      match {order.reference}.
                    </p>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = new FormData(e.currentTarget);
                        setBusy(true);
                        try {
                          const r = await adminApi<Order>(`${path}/reconcile`, {
                            method: "POST",
                            body: JSON.stringify({
                              externalOrderId: Number(
                                form.get("externalOrderId"),
                              ),
                            }),
                          });
                          onUpdated(r);
                          setShipment(await adminApi<Shipment | null>(path));
                          setError("");
                        } catch (e) {
                          setError(
                            e instanceof Error
                              ? e.message
                              : "Reconciliation failed.",
                          );
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <AdminField
                        label="Shiprocket order ID"
                        name="externalOrderId"
                        type="number"
                        required
                        min={1}
                      />
                      <AdminButton
                        type="submit"
                        busy={busy}
                        style={{ marginTop: 12 }}
                      >
                        Reconcile shipment
                      </AdminButton>
                    </form>
                    {shipment.state === "FAILED" && (
                      <AdminButton
                        variant="secondary"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await adminApi(`${path}/failed`, {
                              method: "DELETE",
                            });
                            setShipment(null);
                            onUpdated({ ...order, shipment: null });
                            setError("");
                          } catch (e) {
                            setError(
                              e instanceof Error
                                ? e.message
                                : "Could not reset.",
                            );
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Reset rejected request
                      </AdminButton>
                    )}
                  </>
                ) : (
                  shipment.state !== "CANCELLED" && (
                    <>
                      {!shipment.awb && ready && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = new FormData(e.currentTarget);
                            void perform(
                              "awb",
                              Number(form.get("courierId")) || undefined,
                            );
                          }}
                        >
                          <AdminField
                            label="Courier ID (optional)"
                            name="courierId"
                            type="number"
                            min={1}
                            hint="Leave blank for the provider's recommended courier, or enter a courier ID from Shiprocket."
                          />
                          <AdminButton
                            type="submit"
                            busy={busy}
                            style={{ marginTop: 12 }}
                          >
                            Assign AWB
                          </AdminButton>
                        </form>
                      )}
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {shipment.awb && ready && !shipment.pickupScheduled && (
                          <AdminButton
                            disabled={busy || !configured}
                            onClick={() => void perform("pickup")}
                          >
                            Schedule pickup
                          </AdminButton>
                        )}
                        {shipment.awb && ready && (
                          <>
                            <AdminButton
                              variant="secondary"
                              disabled={busy}
                              onClick={() => void perform("label")}
                            >
                              Generate label
                            </AdminButton>
                            <AdminButton
                              variant="secondary"
                              disabled={busy}
                              onClick={() => void perform("manifest")}
                            >
                              Generate manifest
                            </AdminButton>
                          </>
                        )}
                        <AdminButton
                          variant="secondary"
                          disabled={busy || !configured}
                          onClick={() => void perform("sync")}
                        >
                          <RefreshCw size={13} />
                          Sync tracking
                        </AdminButton>
                        {!["SHIPPED", "DELIVERED", "CANCELLED"].includes(
                          order.status,
                        ) && (
                          <AdminButton
                            variant="danger"
                            disabled={busy || !configured}
                            onClick={() => void perform("cancel")}
                          >
                            Cancel shipment
                          </AdminButton>
                        )}
                      </div>
                      <div
                        style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
                      >
                        {shipment.labelUrl && (
                          <a
                            className="ad-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={shipment.labelUrl}
                          >
                            Download label
                          </a>
                        )}
                        {shipment.manifestUrl && (
                          <a
                            className="ad-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={shipment.manifestUrl}
                          >
                            Download manifest
                          </a>
                        )}
                      </div>
                    </>
                  )
                )}
              </>
            ) : ready ? (
              <form onSubmit={create}>
                <p className="ad-small-label" style={{ marginBottom: 15 }}>
                  Enter the packed parcel dimensions in cm and total weight in
                  kg. The existing customer shipping fee is unchanged by courier
                  booking.
                </p>
                <div className="ad-fields-two">
                  {["length", "breadth", "height", "weight"].map((k) => (
                    <AdminField
                      key={k}
                      label={
                        k === "weight"
                          ? "Weight (kg)"
                          : `${k[0].toUpperCase() + k.slice(1)} (cm)`
                      }
                      name={k}
                      type="number"
                      min={k === "weight" ? 0.01 : 0.51}
                      step={0.01}
                      max={k === "weight" ? 100 : 200}
                      required
                    />
                  ))}
                </div>
                <AdminButton
                  type="submit"
                  busy={busy}
                  disabled={!configured}
                  style={{ marginTop: 15 }}
                >
                  Create Shiprocket order
                </AdminButton>
              </form>
            ) : (
              <p className="ad-small-label">
                Orders must be confirmed, with any UPI payment verified, before
                shipping can be booked.
              </p>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="ad-alert ad-alert--error">
            {error}
          </p>
        )}
        <a
          className="ad-link"
          href={`/api/admin/orders/${order.reference}/invoice`}
        >
          <Download size={14} />
          Download invoice PDF
        </a>
      </div>
    </section>
  );
}
