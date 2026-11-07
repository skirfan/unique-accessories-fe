"use client";
import { useHasMounted } from "@/lib/use-has-mounted";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartProductImage } from "./cart-product-image";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useCheckoutQuote } from "@/lib/use-checkout-quote";
import { useCatalog } from "@/components/providers/catalog-provider";
import { api } from "@/lib/api";
import type { CheckoutQuote } from "@/types/commerce";

export function CartPageContent() {
  const mounted = useHasMounted();
  const lines = useCartStore((s) => s.lines);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCouponCode = useCartStore((s) => s.setCouponCode);
  const { basket, quote, error, reload } = useCheckoutQuote();
  const { settings } = useCatalog();
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const subtotal = quote?.subtotal ?? 0;
  const discount = quote?.discount ?? 0;
  const shipping = quote?.shippingFee ?? 0;
  const total = quote?.total ?? 0;
  const coupon = couponCode ? { code: couponCode } : undefined;
  const remainingForFreeShipping = Math.max(
    0,
    settings.freeShippingThreshold - (subtotal - discount),
  );
  const [applying, setApplying] = useState(false);
  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    try {
      const result = await api<CheckoutQuote>("/checkout/review", {
        method: "POST",
        body: JSON.stringify({ ...basket, couponCode: code }),
      });
      setCouponCode(result.couponCode);
      setMessage({ type: "success", text: "Coupon applied." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not apply coupon.",
      });
    } finally {
      setApplying(false);
    }
  }

  if (!mounted)
    return <p className="py-10 text-navy-500">Loading your cart…</p>;
  if (lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse the catalog and add a few things you'll actually use."
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <ul className="flex flex-col divide-y divide-navy-100 rounded-2xl border border-navy-100">
        {lines.map((stored) => {
          const line = {
            ...stored,
            ...quote?.lines.find((l) => l.variantId === stored.variantId),
          };
          return (
            <li key={line.variantId} className="flex gap-3 p-3 sm:gap-4 sm:p-5">
              <CartProductImage
                line={line}
                className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/product/${line.productSlug}`}
                    className="font-display text-base font-semibold text-navy-900 hover:text-accent-600"
                  >
                    {line.productName}
                  </Link>
                  <p className="mt-0.5 text-sm text-navy-400">
                    {line.variantLabel}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <CartLineControls line={line} />
                  <div className="text-right">
                    <p className="font-display text-base font-bold text-navy-900">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </p>
                    {line.quantity > 1 && (
                      <p className="text-xs text-navy-400">
                        {formatPrice(line.unitPrice)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-2xl border border-navy-100 p-6">
        <h2 className="font-display text-lg font-bold text-navy-900">
          Order Summary
        </h2>

        <form onSubmit={handleApply} className="mt-4 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            aria-label="Coupon code"
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus:border-accent-400"
          />
          <button
            type="submit"
            disabled={applying}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Apply
          </button>
        </form>
        <div aria-live="polite">
          {message && (
            <p
              className={`mt-2 text-xs ${message.type === "success" ? "text-emerald-600" : "text-red-500"}`}
            >
              {message.text}
            </p>
          )}
        </div>
        {coupon && (
          <button
            type="button"
            onClick={() => {
              removeCoupon();
              setMessage(null);
            }}
            className="mt-2 text-xs font-medium text-navy-400 underline"
          >
            Remove coupon &ldquo;{coupon.code}&rdquo;
          </button>
        )}

        {error && (
          <div role="alert" className="mt-4 text-sm text-red-700">
            {error}{" "}
            <button type="button" onClick={reload} className="underline">
              Retry
            </button>
          </div>
        )}
        {!quote && !error && (
          <p className="mt-4 text-sm text-navy-500">
            Checking prices and availability…
          </p>
        )}
        {quote && !quote.eligible && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
          >
            Add {formatPrice(quote.remainingForMinimum)} more to place an order.
            Minimum {formatPrice(quote.minimumOrderAmount)} after discounts,
            excluding shipping.
          </p>
        )}
        <div className="mt-5 flex flex-col gap-2.5 border-t border-navy-100 pt-5 text-sm">
          <div className="flex justify-between text-navy-600">
            <span>Subtotal</span>
            <span>{quote ? formatPrice(subtotal) : "—"}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-navy-600">
            <span>Shipping</span>
            <span>
              {!quote ? "—" : shipping === 0 ? "Free" : formatPrice(shipping)}
            </span>
          </div>
          {remainingForFreeShipping > 0 && (
            <p className="text-xs text-accent-600">
              Add {formatPrice(remainingForFreeShipping)} more for free shipping
            </p>
          )}
          <div className="flex justify-between border-t border-navy-100 pt-2.5 font-display text-base font-bold text-navy-900">
            <span>Total</span>
            <span>{quote ? formatPrice(total) : "—"}</span>
          </div>
        </div>

        {quote?.eligible ? (
          <Link
            href="/checkout"
            className={buttonVariants({
              variant: "primary",
              className: "mt-6 w-full",
            })}
          >
            Proceed to Checkout
          </Link>
        ) : (
          <button
            disabled
            className={buttonVariants({
              variant: "primary",
              className: "mt-6 w-full opacity-50",
            })}
          >
            Proceed to Checkout
          </button>
        )}
        <Link
          href="/products"
          className={buttonVariants({
            variant: "ghost",
            className: "mt-2 w-full",
          })}
        >
          Continue Shopping
        </Link>
      </aside>
    </div>
  );
}
