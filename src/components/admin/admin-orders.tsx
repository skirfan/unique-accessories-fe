"use client";
import { AdminShipping } from "./admin-shipping";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCheck,
  CreditCard,
  History,
  Mail,
  MapPin,
  Package,
  Phone,
  UserRound,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { statusLabel, type Order } from "@/types/commerce";
import {
  AdminButton,
  AdminField,
  AdminPageHeading,
  AdminSelect,
  StatusBadge,
} from "./admin-ui";
import { AdminRefresh } from "./admin-refresh";
function availableActions(order: Order) {
  const actions: { value: string; label: string }[] = [];
  if (order.status === "AWAITING_APPROVAL")
    actions.push({ value: "accept", label: "Accept order and allocate stock" });
  if (
    order.paymentMethod === "UPI" &&
    order.paymentStatus === "PENDING_VERIFICATION" &&
    ["CONFIRMED", "PACKED"].includes(order.status)
  )
    actions.push(
      { value: "verify-payment", label: "Verify UPI receipt and mark paid" },
      { value: "reject-payment", label: "Reject unverifiable UPI reference" },
    );
  if (order.paymentMethod === "COD" || order.paymentStatus === "PAID") {
    if (order.status === "CONFIRMED")
      actions.push({ value: "packed", label: "Mark packed" });
    if (order.status === "PACKED")
      actions.push({ value: "shipped", label: "Mark shipped" });
    if (order.status === "SHIPPED")
      actions.push({ value: "delivered", label: "Mark delivered" });
  }
  if (
    order.paymentMethod === "COD" &&
    order.status === "DELIVERED" &&
    order.paymentStatus === "UNPAID"
  )
    actions.push({ value: "collect-cod", label: "Record COD collection" });
  if (order.paymentStatus === "REFUND_REQUIRED")
    actions.push({
      value: "refund-recorded",
      label: "Record completed manual refund",
    });
  if (order.status === "AWAITING_APPROVAL")
    actions.push({ value: "reject", label: "Reject request" });
  if (["AWAITING_APPROVAL", "CONFIRMED", "PACKED"].includes(order.status))
    actions.push({ value: "cancel", label: "Cancel order" });
  return actions;
}
function OrderActions({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: (order: Order) => void;
}) {
  const actions = availableActions(order);
  const [action, setAction] = useState(actions[0]?.value ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      onUpdated(
        await adminApi<Order>(`/admin/orders/${order.reference}/action`, {
          method: "POST",
          body: JSON.stringify({
            action,
            note: String(form.get("note") ?? ""),
            ...(action === "shipped"
              ? { trackingNumber: String(form.get("trackingNumber") ?? "") }
              : {}),
          }),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update this order.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ad-card">
      <div className="ad-card-heading">
        <div>
          <h2>Next step</h2>
          <p>Keep this order moving forward.</p>
        </div>
        <Package size={16} color="#9ca7b9" />
      </div>
      {!actions.length ? (
        <div className="ad-detail-body">
          <p className="ad-small-label">
            No further actions are available for this order.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="ad-action-form">
          <AdminSelect
            label="Action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {actions.map((a) => (
              <option value={a.value} key={a.value}>
                {a.label}
              </option>
            ))}
          </AdminSelect>
          {action === "accept" && (
            <p className="ad-action-note">
              Check stock and delivery availability before accepting. Stock is
              allocated when you accept this request.
            </p>
          )}
          {action === "shipped" && (
            <AdminField
              label="Courier and tracking number"
              name="trackingNumber"
              required
              maxLength={100}
            />
          )}
          <AdminField
            label={
              action === "refund-recorded"
                ? "Refund transaction reference and note"
                : action === "reject-payment"
                  ? "Reason the UPI reference could not be verified"
                  : "Customer-visible note (optional)"
            }
            name="note"
            required={["refund-recorded", "reject-payment"].includes(action)}
            maxLength={500}
          />
          {action === "verify-payment" && (
            <>
              <p className="ad-action-note">
                Reference: <strong>{order.paymentReference}</strong>
                <br />
                Amount to verify: <strong>{formatPrice(order.total)}</strong>
              </p>
              <label className="ad-action-checkbox">
                <input type="checkbox" required />
                <span>
                  I checked the merchant account and verified the exact amount
                  and reference were received. A screenshot alone is
                  insufficient.
                </span>
              </label>
            </>
          )}
          {action === "collect-cod" && (
            <label className="ad-action-checkbox">
              <input type="checkbox" required />I confirm the delivery payment
              has been collected.
            </label>
          )}
          {action === "refund-recorded" && (
            <label className="ad-action-checkbox">
              <input type="checkbox" required />I confirm the refund has already
              been sent to the customer.
            </label>
          )}
          {["cancel", "reject"].includes(action) && (
            <label className="ad-action-checkbox">
              <input type="checkbox" required />I confirm this request should be{" "}
              {action === "cancel" ? "cancelled" : "rejected"}.
            </label>
          )}
          {error && (
            <p role="alert" className="ad-alert ad-alert--error">
              {error}
            </p>
          )}
          <AdminButton
            type="submit"
            busy={busy}
            variant={
              ["reject", "cancel"].includes(action) ? "danger" : "primary"
            }
          >
            {busy ? "Updating order…" : "Apply action"}
          </AdminButton>
        </form>
      )}
    </section>
  );
}
export function AdminOrderDetail({ initial }: { initial: Order }) {
  const [order, setOrder] = useState(initial);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const address = order.shippingAddress;
  function updated(result: Order) {
    setOrder(result);
    setSaved(true);
    toast.success("Order updated successfully.");
    router.refresh();
  }
  return (
    <>
      <Link
        href="/admin/orders"
        className="ad-link"
        style={{ marginBottom: 20 }}
      >
        <ArrowLeft size={13} />
        Back to orders
      </Link>
      <AdminPageHeading
        eyebrow="ORDER DETAILS"
        title={order.reference}
        description={`Placed ${new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} IST`}
      >
        <AdminRefresh label="Refresh order" />
      </AdminPageHeading>
      <div
        className="ad-detail-meta"
        style={{ marginTop: -12, marginBottom: 25 }}
      >
        <StatusBadge value={order.status} />
        <StatusBadge value={order.paymentStatus} />
        <span className="ad-small-label">
          {order.paymentMethod === "COD"
            ? "Cash on delivery"
            : "UPI · manual verification"}
        </span>
      </div>
      {saved && (
        <p
          role="status"
          className="ad-alert ad-alert--success"
          style={{ marginBottom: 20 }}
        >
          <span>
            <CheckCheck size={15} className="inline" /> Order updated
            successfully.
          </span>
          <AdminButton variant="ghost" onClick={() => setSaved(false)}>
            Dismiss
          </AdminButton>
        </p>
      )}
      <div className="ad-detail-layout">
        <div className="ad-detail-stack">
          <AdminShipping order={order} onUpdated={updated} />
          <section className="ad-card">
            <div className="ad-card-heading">
              <div>
                <h2>Order items</h2>
                <p>
                  {order.items.reduce((n, item) => n + item.quantity, 0)} items
                  in this order
                </p>
              </div>
              <Package size={17} color="#9ca7b9" />
            </div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <span style={{ color: "#68778d", fontWeight: 500 }}>
                          {item.productName}
                        </span>
                        <small>
                          {item.variantLabel} · {item.sku}
                        </small>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.unitPrice)}</td>
                      <td className="ad-amount">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ad-totals">
              {[
                ["Subtotal", order.subtotal],
                ["Discount", -order.discount],
                ["Shipping", order.shippingFee],
                ["Order total", order.total],
              ].map(([label, amount]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{formatPrice(Number(amount))}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="ad-card">
            <div className="ad-card-heading">
              <h2>Customer & delivery</h2>
              <UserRound size={16} color="#9ca7b9" />
            </div>
            <div className="ad-detail-body ad-detail-grid">
              <div>
                <h3>Customer</h3>
                <p>
                  <strong>{order.customerName}</strong>
                  <br />
                  <a href={`mailto:${order.customerEmail}`}>
                    <Mail size={11} className="inline" /> {order.customerEmail}
                  </a>
                  <br />
                  <a href={`tel:${order.customerPhone}`}>
                    <Phone size={11} className="inline" /> {order.customerPhone}
                  </a>
                </p>
              </div>
              <div>
                <h3>
                  <MapPin size={11} className="inline" /> Delivery address
                </h3>
                <p>
                  {address.line1}
                  <br />
                  {address.line2 && (
                    <>
                      {address.line2}
                      <br />
                    </>
                  )}
                  {address.city}, {address.state}
                  <br />
                  {address.pincode}
                </p>
              </div>
            </div>
            {order.trackingNumber && (
              <div
                className="ad-detail-body"
                style={{ borderTop: "1px solid #eef0f5" }}
              >
                <span className="ad-small-label">Courier / tracking: </span>
                <strong style={{ fontSize: 11, color: "#6c7e96" }}>
                  {order.trackingNumber}
                </strong>
              </div>
            )}
          </section>
          <section className="ad-card">
            <div className="ad-card-heading">
              <div>
                <h2>Order timeline</h2>
                <p>A record of every step.</p>
              </div>
              <History size={16} color="#9ca7b9" />
            </div>
            <ol className="ad-timeline">
              {[...order.history].reverse().map((entry, index) => (
                <li key={index}>
                  <strong>{statusLabel(entry.status)}</strong>
                  <p>{entry.note}</p>
                  <time>
                    {new Date(entry.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    IST
                  </time>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className="ad-detail-stack">
          <OrderActions
            key={`${order.reference}-${order.history.length}`}
            order={order}
            onUpdated={updated}
          />
          <section className="ad-card">
            <div className="ad-card-heading">
              <h2>Payment summary</h2>
              <CreditCard size={16} color="#9ca7b9" />
            </div>
            <div className="ad-config-list">
              <div>
                <span>Method</span>
                <strong>{order.paymentMethod}</strong>
              </div>
              <div>
                <span>Status</span>
                <StatusBadge value={order.paymentStatus} />
              </div>
              <div>
                <span>Total amount</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              {order.paymentReference && (
                <div>
                  <span>UPI reference</span>
                  <strong>{order.paymentReference}</strong>
                </div>
              )}
              {order.paymentVerifiedAt && (
                <div>
                  <span>Verified on</span>
                  <strong>
                    {new Date(order.paymentVerifiedAt).toLocaleDateString(
                      "en-IN",
                      { timeZone: "Asia/Kolkata" },
                    )}
                  </strong>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
