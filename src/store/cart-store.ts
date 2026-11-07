"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Coupon } from "@/types";

interface CartState {
  lines: CartLine[];
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  couponCode: string | null;
  /** Returns true if the requested quantity had to be capped at available stock. */
  addItem: (line: CartLine) => boolean;
  removeItem: (variantId: string) => void;
  /** Returns true if the requested quantity had to be capped at available stock. */
  updateQuantity: (variantId: string, quantity: number) => boolean;
  clear: () => void;
  setCouponCode: (code: string | null) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      couponCode: null,

      addItem: (line) => {
        if (line.stock <= 0 || line.quantity <= 0) return true;
        let clamped = false;
        set((state) => {
          const existing = state.lines.find(
            (l) => l.variantId === line.variantId,
          );
          if (existing) {
            const desired = existing.quantity + line.quantity;
            const quantity = Math.min(desired, line.stock);
            clamped = quantity < desired;
            return {
              drawerOpen: true,
              lines: state.lines.map((l) =>
                l.variantId === line.variantId ? { ...line, quantity } : l,
              ),
            };
          }
          if (line.quantity > line.stock) {
            clamped = true;
            return {
              drawerOpen: true,
              lines: [...state.lines, { ...line, quantity: line.stock }],
            };
          }
          return { lines: [...state.lines, line], drawerOpen: true };
        });
        return clamped;
      },

      removeItem: (variantId) => {
        set((state) => ({
          lines: state.lines.filter((l) => l.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        let clamped = false;
        set((state) => ({
          lines: state.lines
            .map((l) => {
              if (l.variantId !== variantId) return l;
              const next = Math.max(1, Math.min(quantity, l.stock));
              clamped = next < quantity;
              return { ...l, quantity: next };
            })
            .filter((l) => l.quantity > 0),
        }));
        return clamped;
      },

      clear: () => set({ lines: [], couponCode: null }),

      setCouponCode: (couponCode) => set({ couponCode }),

      removeCoupon: () => set({ couponCode: null }),
    }),
    {
      name: "ua-cart",
      partialize: (state) => ({
        lines: state.lines,
        couponCode: state.couponCode,
      }),
    },
  ),
);

export function selectSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

export function selectItemCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function computeDiscount(subtotal: number, coupon: Coupon | undefined) {
  if (!coupon || subtotal < coupon.minOrderValue) return 0;
  if (coupon.type === "PERCENT")
    return Math.round((subtotal * coupon.value) / 100);
  return Math.min(coupon.value, subtotal);
}

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 79;

export function computeShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
    ? 0
    : STANDARD_SHIPPING_FEE;
}
