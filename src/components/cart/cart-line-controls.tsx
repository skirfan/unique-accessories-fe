"use client";

import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCartStore } from "@/store/cart-store";
import type { CartLine } from "@/types";
import { toast } from "sonner";

interface CartLineControlsProps {
  line: CartLine;
  compact?: boolean;
}

export function CartLineControls({ line, compact }: CartLineControlsProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-3">
      <QuantityStepper
        value={line.quantity}
        max={line.stock}
        onChange={(qty) => {
          const clamped = updateQuantity(line.variantId, qty);
          if (clamped) toast.message(`Only ${line.stock} left in stock`);
        }}
        className={compact ? "scale-90 origin-left" : undefined}
      />
      <button
        type="button"
        aria-label="Remove item"
        onClick={() => {
          removeItem(line.variantId);
          toast("Removed from cart");
        }}
        className="text-navy-300 transition-colors hover:text-accent-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
