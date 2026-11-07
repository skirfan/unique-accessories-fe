"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Banknote, QrCode, ShoppingBag, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useCheckoutQuote } from "@/lib/use-checkout-quote";
import { useCustomer } from "@/components/providers/customer-provider";
import { api } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import type { Order } from "@/types/commerce";

export function CheckoutContent() {
  const router = useRouter();
  const { user } = useCustomer();
  const { settings } = useCatalog();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const { basket, quote, error: quoteError, reload } = useCheckoutQuote();
  const mounted = useHasMounted();
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">(
    settings.codEnabled ? "COD" : "UPI",
  );
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quote?.eligible || placing) return;
    const form = new FormData(e.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const order = {
      basket,
      paymentMethod,
      customer: {
        name: value("name"),
        email: value("email"),
        phone: value("phone"),
      },
      address: {
        line1: value("line1"),
        line2: value("line2"),
        city: value("city"),
        state: value("state"),
        pincode: value("pincode"),
      },
    };
    setPlacing(true);
    setError("");
    try {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(order)),
      );
      const fingerprint = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      try {
        attempt.current ??= JSON.parse(
          sessionStorage.getItem("ua-checkout-attempt") ?? "null",
        );
      } catch {
        /* In-memory retry is still available. */
      }
      if (attempt.current?.fingerprint !== fingerprint)
        attempt.current = { fingerprint, key: crypto.randomUUID() };
      try {
        sessionStorage.setItem(
          "ua-checkout-attempt",
          JSON.stringify(attempt.current),
        );
      } catch {
        /* Storage may be unavailable in private browsing. */
      }
      const result = await api<{ order: Order; accessToken: string }>(
        "/orders",
        {
          method: "POST",
          body: JSON.stringify({
            ...order,
            quoteToken: quote.quoteToken,
            idempotencyKey: attempt.current!.key,
          }),
        },
      );
      try {
        sessionStorage.setItem(
          `ua-order-${result.order.reference}`,
          result.accessToken,
        );
        sessionStorage.removeItem("ua-checkout-attempt");
      } catch {
        /* The private fragment also preserves access. */
      }
      clear();
      router.push(`/orders/${result.order.reference}#${result.accessToken}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit your order. Please try again.",
      );
      reload();
      router.refresh();
    } finally {
      setPlacing(false);
    }
  }

  if (!mounted) return <p className="py-12 text-navy-500">Loading checkout…</p>;
  if (!lines.length)
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out yet"
        description="Add products to your cart before heading to checkout."
        actionLabel="Browse Products"
        actionHref="/products"
      />
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-accent-100 bg-accent-50 p-5 text-sm text-navy-700">
          <p className="font-semibold">
            {settings.autoApproveOrders
              ? "Place your order with confidence."
              : "Order now. Pay after confirmation."}
          </p>
          <p className="mt-1">
            {settings.autoApproveOrders
              ? "We confirm stock as soon as you place your order. Choose Cash on Delivery or pay by UPI on your confirmation page."
              : "We’ll check availability before accepting your request. Please wait for confirmation before paying."}
            {!user && (
              <span className="mt-2 block">
                <Link href="/login?next=/checkout" className="underline">
                  Sign in with Google
                </Link>{" "}
                to save this order to your account, or continue as a guest.
              </span>
            )}
          </p>
        </div>
        <section className="rounded-2xl border border-navy-100 p-6">
          <h2 className="font-display text-lg font-bold">Contact details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField
              label="Full name"
              name="name"
              defaultValue={user?.name ?? ""}
              key={user?.id ?? "guest-name"}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
            <FormField
              label="Mobile number"
              name="phone"
              type="tel"
              required
              pattern="(\+91)?[6-9][0-9]{9}"
              placeholder="9876543210"
              autoComplete="tel"
            />
            <FormField
              label="Email"
              name="email"
              defaultValue={user?.email ?? ""}
              readOnly={Boolean(user)}
              key={user?.id ?? "guest-email"}
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              wrapperClassName="sm:col-span-2"
            />
          </div>
        </section>
        <section className="rounded-2xl border border-navy-100 p-6">
          <h2 className="font-display text-lg font-bold">Delivery address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField
              label="Address line 1"
              name="line1"
              required
              minLength={5}
              maxLength={200}
              autoComplete="address-line1"
              wrapperClassName="sm:col-span-2"
            />
            <FormField
              label="Address line 2 (optional)"
              name="line2"
              maxLength={200}
              autoComplete="address-line2"
              wrapperClassName="sm:col-span-2"
            />
            <FormField
              label="City"
              name="city"
              required
              minLength={2}
              maxLength={100}
              autoComplete="address-level2"
            />
            <FormField
              label="State / Union territory"
              name="state"
              required
              minLength={2}
              maxLength={100}
              autoComplete="address-level1"
            />
            <FormField
              label="PIN code"
              name="pincode"
              required
              pattern="[1-9][0-9]{5}"
              maxLength={6}
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </div>
        </section>
        <section className="rounded-2xl border border-navy-100 p-6">
          <h2 className="font-display text-lg font-bold">
            How would you like to pay?
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            {settings.autoApproveOrders
              ? "Pay on delivery, or scan the UPI QR after placing your order."
              : "Your choice applies after we accept the order."}
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {(
              [
                {
                  method: "COD",
                  enabled: settings.codEnabled,
                  title: "Cash on Delivery",
                  description: "Pay when your order arrives.",
                  Icon: Banknote,
                },
                {
                  method: "UPI",
                  enabled: settings.upiEnabled,
                  title: "Pay with UPI",
                  description:
                    "Scan the QR on your confirmation page and submit your UTR. We verify receipt before shipping.",
                  Icon: QrCode,
                },
              ] as const
            )
              .filter((m) => m.enabled)
              .map(({ method, title, description, Icon }) => (
                <label
                  key={method}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border p-4",
                    paymentMethod === method
                      ? "border-accent-400 bg-accent-50/40"
                      : "border-navy-100",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="mt-1"
                  />
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="mt-1 block text-xs text-navy-500">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
          </div>
        </section>
      </div>
      <aside className="h-fit rounded-2xl border border-navy-100 p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-bold">Your order</h2>
        <ul className="mt-4 space-y-3 border-b border-navy-100 pb-4">
          {(quote?.lines ?? lines).map((line) => (
            <li
              key={line.variantId}
              className="flex justify-between gap-3 text-sm"
            >
              <span>
                {line.productName}{" "}
                <span className="text-navy-400">× {line.quantity}</span>
              </span>
              <span className="shrink-0">
                {formatPrice(line.unitPrice * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        {quote ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(quote.subtotal)}</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>−{formatPrice(quote.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {quote.shippingFee ? formatPrice(quote.shippingFee) : "Free"}
              </span>
            </div>
            <div className="flex justify-between border-t border-navy-100 pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(quote.total)}</span>
            </div>
            {quote.minimumOrderEnabled && (
              <p
                className={cn(
                  "rounded-lg p-3 text-xs",
                  quote.eligible
                    ? "bg-navy-50 text-navy-500"
                    : "bg-amber-50 text-amber-800",
                )}
              >
                {quote.eligible
                  ? `Minimum merchandise order: ${formatPrice(quote.minimumOrderAmount)} after discounts.`
                  : `Add ${formatPrice(quote.remainingForMinimum)} more to place an order. Minimum ${formatPrice(quote.minimumOrderAmount)}, excluding shipping.`}
              </p>
            )}
          </div>
        ) : (
          !quoteError && (
            <p className="mt-4 text-sm text-navy-500">
              Checking current prices and availability…
            </p>
          )
        )}
        {(error || quoteError) && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error || quoteError}
            <button type="button" onClick={reload} className="ml-2 underline">
              Check again
            </button>
          </div>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!quote?.eligible || placing || Boolean(quoteError)}
          className="mt-6 w-full disabled:opacity-50"
        >
          {placing ? "Submitting…" : "Place order"}
        </Button>
        <p className="mt-3 text-center text-xs text-navy-500">
          By submitting, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>
          . Your final total and available stock are checked when you place the
          order.
        </p>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-navy-500">
          <ShieldCheck className="h-4 w-4" /> No online payment required now
        </p>
      </aside>
    </form>
  );
}
