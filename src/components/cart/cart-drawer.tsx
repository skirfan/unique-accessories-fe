"use client";
import { useCatalog } from "@/components/providers/catalog-provider";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { CartProductImage } from "./cart-product-image";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  selectItemCount,
  selectSubtotal,
  useCartStore,
} from "@/store/cart-store";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useFocusTrap } from "@/lib/use-focus-trap";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { settings } = useCatalog();
  const persistedLines = useCartStore((s) => s.lines);
  const mounted = useHasMounted();
  const lines = mounted ? persistedLines : [];
  const subtotal = selectSubtotal(lines);
  const remainingForFreeShipping = Math.max(
    0,
    settings.freeShippingThreshold - subtotal,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  return (
    <div
      className={`premium-cart-overlay fixed inset-0 z-[80] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-navy-950/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={`premium-cart-panel absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-5">
          <h2 className="font-display text-lg font-bold text-navy-900">
            Your Cart ({selectItemCount(lines)})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-navy-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-300">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <p className="text-sm text-navy-500">
              Your cart is empty. Let&apos;s fix that.
            </p>
            <Link
              href="/products"
              onClick={onClose}
              className={buttonVariants({ variant: "primary" })}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {remainingForFreeShipping > 0 && (
              <p className="bg-accent-50 px-6 py-2.5 text-xs font-medium text-accent-600">
                Add {formatPrice(remainingForFreeShipping)} more for free
                shipping
              </p>
            )}
            <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {lines.map((line) => (
                  <li key={line.variantId} className="flex gap-3">
                    <CartProductImage
                      line={line}
                      className="h-20 w-20 shrink-0"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Link
                        href={`/product/${line.productSlug}`}
                        onClick={onClose}
                        className="line-clamp-1 font-display text-sm font-semibold text-navy-900 hover:text-accent-600"
                      >
                        {line.productName}
                      </Link>
                      <p className="text-xs text-navy-400">
                        {line.variantLabel}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <CartLineControls line={line} compact />
                        <span className="font-display text-sm font-bold text-navy-900">
                          {formatPrice(line.unitPrice * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-navy-100 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex items-center justify-between font-display">
                <span className="text-sm text-navy-500">
                  Estimated subtotal
                </span>
                <span className="text-lg font-bold text-navy-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mb-4 text-xs text-navy-500">
                Shipping and discounts are confirmed at checkout. No payment is
                required to request an order.
              </p>
              <Link
                href="/checkout"
                onClick={onClose}
                className={buttonVariants({
                  variant: "primary",
                  className: "w-full",
                })}
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className={buttonVariants({
                  variant: "ghost",
                  className: "mt-2 w-full",
                })}
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
