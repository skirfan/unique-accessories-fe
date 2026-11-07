"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Heart } from "lucide-react";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";
import { getProductVisual } from "@/lib/product-images";
import { useProductSelection } from "./product-selection";
import { toast } from "sonner";

export function BuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const { variantId, setVariantId } = useProductSelection();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useWishlistStore();
  const mounted = useHasMounted();
  const wishlisted = mounted && wishlist.has(product.id);

  const variant = useMemo(
    () =>
      product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );

  const hasOptions = product.variants.length > 1;
  const label = (v: typeof variant) =>
    [v.color, v.material, v.capacity].filter(Boolean).join(" / ") || v.sku;
  const inStock = variant.stock > 0;

  function handleAddToCart(checkout = false) {
    const clamped = addItem({
      variantId: variant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: label(variant),
      visual: getProductVisual(product, variant.id),
      unitPrice: variant.price,
      compareAtPrice: variant.compareAtPrice,
      quantity: Math.min(quantity, variant.stock),
      stock: variant.stock,
    });
    if (clamped) toast.message(`Only ${variant.stock} left in stock`);
    if (checkout) {
      closeDrawer();
      router.push("/checkout");
    }
  }

  return (
    <div className="premium-buy-box">
      <Price
        price={variant.price}
        compareAtPrice={variant.compareAtPrice}
        size="lg"
      />

      {hasOptions && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-navy-900">
            Choose an option
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id);
                  setQuantity(1);
                }}
                aria-pressed={v.id === variantId}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  v.id === variantId
                    ? "border-accent-500 bg-accent-50 text-accent-700"
                    : "border-navy-100 text-navy-600",
                )}
              >
                {v.colorHex && (
                  <span
                    className="h-4 w-4 rounded-full border border-navy-200"
                    style={{ backgroundColor: v.colorHex }}
                  />
                )}
                {label(v)}
                {v.stock === 0 ? " · Sold out" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-sm font-medium">
        {inStock ? (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Check className="h-4 w-4" /> In stock
            {variant.stock <= 10 ? ` — only ${variant.stock} left` : ""}
          </span>
        ) : (
          <span className="text-red-500">Out of stock</span>
        )}
      </div>

      <div className="premium-buy-actions">
        <QuantityStepper
          value={quantity}
          max={Math.max(1, variant.stock)}
          onChange={setQuantity}
        />
        <button
          type="button"
          onClick={() => handleAddToCart()}
          disabled={!inStock}
          className={buttonVariants({
            variant: "primary",
            size: "lg",
            className: "min-w-0 flex-1 px-4 text-sm disabled:opacity-40",
          })}
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => {
            wishlist.toggle(product.id);
            toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label="Toggle wishlist"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy-100 text-navy-600 transition-colors hover:border-accent-300 hover:text-accent-500"
        >
          <Heart
            className={cn(
              "h-5 w-5",
              wishlisted && "fill-accent-500 text-accent-500",
            )}
          />
        </button>
      </div>
      <button
        type="button"
        className="premium-buy-now"
        disabled={!inStock}
        onClick={() => handleAddToCart(true)}
      >
        Buy Now
      </button>
      <p className="premium-payment-note">
        Pay on delivery or use UPI after placing your order.
      </p>
    </div>
  );
}
