"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart-store";
import type { CheckoutQuote } from "@/types/commerce";
export function useCheckoutQuote() {
  const lines = useCartStore((s) => s.lines);
  const couponCode = useCartStore((s) => s.couponCode);
  const basketKey = JSON.stringify({
    items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    couponCode,
  });
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{
    key: string;
    quote?: CheckoutQuote;
    error?: string;
  }>({ key: "" });
  useEffect(() => {
    if (!JSON.parse(basketKey).items.length) return;
    const controller = new AbortController();
    api<CheckoutQuote>("/checkout/review", {
      method: "POST",
      body: basketKey,
      signal: controller.signal,
    })
      .then((quote) => setState({ key: basketKey, quote }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ key: basketKey, error: error.message });
      });
    return () => controller.abort();
  }, [basketKey, retry]);
  const current = state.key === basketKey ? state : undefined;
  return {
    basket: JSON.parse(basketKey),
    quote: current?.quote,
    error: current?.error,
    reload: () => setRetry((n) => n + 1),
  };
}
