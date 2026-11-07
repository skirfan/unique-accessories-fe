"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CircleCheck,
  Clock3,
  CircleAlert,
  Download,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { useCustomer } from "@/components/providers/customer-provider";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/commerce";
import { OrderSummary } from "./order-summary";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
export function OrderDetails({ reference }: { reference: string }) {
  const { user } = useCustomer();
  const [order, setOrder] = useState<Order | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    async (accessToken: string, signal?: AbortSignal) => {
      const result = await api<Order>(
        `/orders/${encodeURIComponent(reference)}`,
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
          signal,
        },
      );
      setOrder(result);
      setError("");
      setMessage("");
    },
    [reference],
  );
  useEffect(() => {
    const controller = new AbortController();
    let accessToken = window.location.hash.slice(1);
    try {
      accessToken ||= sessionStorage.getItem(`ua-order-${reference}`) ?? "";
      if (accessToken)
        sessionStorage.setItem(`ua-order-${reference}`, accessToken);
    } catch {
      /* The private URL remains usable when storage is blocked. */
    }
    // Defer state changes to the async operation rather than setting state in the effect.
    Promise.resolve()
      .then(() => {
        setToken(accessToken);
        return load(accessToken, controller.signal);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    const timer = setInterval(() => {
      load(accessToken, controller.signal).catch(() => {});
    }, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [reference, load]);
  async function submitReference(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await api<Order>(
        `/orders/${encodeURIComponent(reference)}/payment-reference`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: JSON.stringify({ reference: String(data.get("reference")) }),
        },
      );
      setOrder(result);
      setMessage(
        "Reference submitted. We’ll verify receipt before marking your payment paid.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit reference.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function downloadInvoice() {
    setBusy(true);
    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(reference)}/invoice`,
        {
          credentials: "same-origin",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!response.ok)
        throw new Error(
          "Could not download the invoice. Refresh and try again.",
        );
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${order?.invoiceNumber ?? reference}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not download invoice.");
    } finally {
      setBusy(false);
    }
  }
  if (!order)
    return (
      <div className="rounded-xl bg-navy-50 p-6">
        <p role={error ? "alert" : "status"}>
          {error || "Loading your order…"}
        </p>
        <Link href="/products" className="mt-4 inline-block underline">
          Back to shopping
        </Link>
      </div>
    );
  return (
    <div className="space-y-6">
      <section
        className={`order-confirmation ${["REJECTED", "CANCELLED"].includes(order.status) ? "is-cancelled" : order.status === "AWAITING_APPROVAL" ? "is-pending" : "is-confirmed"}`}
      >
        <div className="order-confirmation-icon">
          {["REJECTED", "CANCELLED"].includes(order.status) ? (
            <CircleAlert />
          ) : order.status === "AWAITING_APPROVAL" ? (
            <Clock3 />
          ) : (
            <CircleCheck />
          )}
        </div>
        <span className="store-eyebrow">{order.reference}</span>
        <h1>
          {["REJECTED", "CANCELLED"].includes(order.status)
            ? "Your order has been cancelled"
            : order.status === "AWAITING_APPROVAL"
              ? "Order request received"
              : order.status === "DELIVERED"
                ? "Your order has arrived"
                : "Thank you! Your order is confirmed."}
        </h1>
        <p>
          {order.status === "AWAITING_APPROVAL"
            ? "Please wait for store confirmation before paying."
            : ["REJECTED", "CANCELLED"].includes(order.status)
              ? "Review the details and any refund updates below."
              : order.paymentStatus === "PAID"
                ? "Payment verified. Follow your delivery updates below."
                : order.paymentMethod === "UPI"
                  ? "Your items are reserved. Complete the UPI payment below so we can prepare your parcel."
                  : "Your items are reserved. Pay when your order arrives, or choose UPI before shipping when available."}
        </p>
        <div className="order-confirmation-facts">
          <span>
            <strong>
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </strong>
            Order date
          </span>
          <span>
            <strong>{formatPrice(order.total)}</strong>Total
          </span>
          <span>
            <strong>
              {order.paymentStatus === "PAID"
                ? "Payment verified"
                : order.paymentStatus === "PENDING_VERIFICATION"
                  ? "Verification pending"
                  : "Payment pending"}
            </strong>
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI"}
          </span>
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        {order.whatsappUrl && (
          <a
            href={order.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "primary" })}
          >
            Send order details on WhatsApp
          </a>
        )}
        <Button variant="outline" onClick={downloadInvoice}>
          <Download size={16} />
          Download invoice
        </Button>
        {user && !order.accountLinked && (
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await api(`/orders/${encodeURIComponent(reference)}/claim`, {
                  method: "POST",
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setOrder((current) =>
                  current ? { ...current, accountLinked: true } : current,
                );
                setMessage("This order is saved to your account.");
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Could not save this order.",
                );
              }
            }}
          >
            Save to my account
          </Button>
        )}
        {!user && (
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Sign in to your account
          </Link>
        )}
        <Button
          variant="outline"
          onClick={() => load(token).catch((err) => setError(err.message))}
        >
          Refresh status
        </Button>
        {token && (
          <Button
            variant="outline"
            onClick={() =>
              navigator.clipboard
                .writeText(
                  `${window.location.origin}/orders/${reference}#${token}`,
                )
                .then(
                  () =>
                    setMessage(
                      "Private order link copied. Keep it safe; it grants access to your order.",
                    ),
                  () =>
                    setError(
                      "Copy the page URL from your browser to save your private order link.",
                    ),
                )
            }
          >
            Copy private order link
          </Button>
        )}
      </div>
      <p className="text-xs text-navy-500">
        Save this private link to return later. WhatsApp opens a prepared
        message; tap Send in WhatsApp to contact us.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {message}
        </p>
      )}
      {order.canPayUpi && order.paymentMethod === "COD" && (
        <section className="order-upi-choice">
          <div>
            <h2>Prefer to pay online?</h2>
            <p>
              Switch to UPI and pay the exact order total before your parcel is
              booked.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                setOrder(
                  await api<Order>(
                    `/orders/${encodeURIComponent(reference)}/pay-with-upi`,
                    {
                      method: "POST",
                      headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                    },
                  ),
                );
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Could not change payment method.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Pay with UPI
          </Button>
        </section>
      )}
      {order.paymentStatus === "PENDING_VERIFICATION" && (
        <div className="order-payment-pending" role="status">
          <Clock3 size={20} />
          <div>
            <strong>Payment reference received</strong>
            <p>
              We are checking your payment. Please do not pay again. Your order
              will be prepared after receipt is verified.
            </p>
          </div>
        </div>
      )}
      {order.paymentStatus === "PAID" && (
        <div className="order-payment-verified">
          <ShieldCheck size={22} />
          <div>
            <strong>Payment verified</strong>
            <p>Your payment has been confirmed by the store.</p>
          </div>
        </div>
      )}
      {order.upi && order.paymentStatus !== "PENDING_VERIFICATION" && (
        <section className="order-upi-panel rounded-2xl border border-navy-100 p-6">
          <h2 className="font-display text-lg font-bold">
            Pay {formatPrice(order.total)} via UPI
          </h2>
          <p className="mt-2 text-sm text-navy-600">{order.upi.instructions}</p>
          {order.upi.customQr && (
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              This is the store’s merchant QR. Enter exactly{" "}
              {formatPrice(order.total)} and include {order.reference} as your
              payment note.
            </p>
          )}
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* A generated, order-specific data URL; Next image optimization is unnecessary. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.upi.qrDataUrl}
              width={240}
              height={240}
              alt={`UPI payment QR for ${order.reference}`}
              className="rounded-xl border border-navy-100"
            />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{order.upi.name}</p>
              {order.upi.id && (
                <div className="order-upi-id">
                  <p className="break-all">
                    UPI ID: <strong>{order.upi.id}</strong>
                  </p>
                  <button
                    aria-label="Copy UPI ID"
                    type="button"
                    onClick={() =>
                      void navigator.clipboard.writeText(order.upi!.id).then(
                        () => setMessage("UPI ID copied."),
                        () =>
                          setError("Could not copy. Select the UPI ID above."),
                      )
                    }
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}
              <p>Amount: {formatPrice(order.total)}</p>
              <p>Payment note: {order.reference}</p>
              {order.upi.url && (
                <a
                  href={order.upi.url}
                  className="inline-block font-semibold text-accent-700 underline"
                >
                  Open a UPI app
                </a>
              )}
              <p className="max-w-sm text-xs text-navy-500">
                Scan the QR, or use the UPI ID when shown. Check the recipient
                name before paying. Do not pay twice while verification is
                pending.
              </p>
            </div>
          </div>
          <form
            onSubmit={submitReference}
            className="mt-6 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-end"
          >
            <FormField
              label="12-digit UPI transaction reference (UTR)"
              name="reference"
              required
              pattern="[0-9]{12}"
              inputMode="numeric"
              maxLength={12}
              defaultValue={order.paymentReference ?? ""}
              wrapperClassName="flex-1"
            />
            <Button type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Submit for verification"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-navy-500">
            Submitting a reference does not confirm payment. We check the
            merchant account before marking it paid.
          </p>
        </section>
      )}
      {order.paymentStatus === "REFUND_REQUIRED" && (
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          A manual refund is due. Please contact the store with your order
          reference.
        </p>
      )}
      <OrderSummary order={order} />
    </div>
  );
}
