"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { ProductVisual } from "./product-visual";
import { Price } from "@/components/ui/price";
import { Badge, ProductBadgeTag } from "@/components/ui/badge";
import { cn, getCheapestVariant } from "@/lib/utils";
import { getProductVisual } from "@/lib/product-images";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const cheapest = getCheapestVariant(product);
  const [selected, setSelected] = useState(cheapest.id);
  const variant = product.variants.find((v) => v.id === selected) ?? cheapest;
  const outOfStock = variant.stock <= 0;
  const wishlist = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const mounted = useHasMounted();
  const wishlisted = mounted && wishlist.has(product.id);
  const visual = getProductVisual(product, variant.id);
  function add() {
    const clamped = addItem({
      variantId: variant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel:
        [variant.color, variant.material, variant.capacity]
          .filter(Boolean)
          .join(" / ") || "Standard",
      visual,
      unitPrice: variant.price,
      compareAtPrice: variant.compareAtPrice,
      quantity: 1,
      stock: variant.stock,
    });
    if (clamped) toast.message(`Only ${variant.stock} left in stock`);
  }
  return (
    <article className="store-product-card group">
      <div className="store-product-media">
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
        >
          <ProductVisual
            visual={visual}
            label={product.name}
            className={cn(
              "aspect-square w-full rounded-none transition-transform duration-300 group-hover:scale-[1.025]",
              outOfStock && "opacity-50 grayscale",
            )}
            iconClassName="h-12 w-12"
          />
        </Link>
        <div className="absolute left-3 top-3">
          {outOfStock ? (
            <Badge variant="outline">Sold out</Badge>
          ) : (
            <ProductBadgeTag badge={product.badge} />
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            wishlist.toggle(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="store-wishlist-button"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              wishlisted && "fill-accent-500 text-accent-600",
            )}
          />
        </button>
      </div>
      <div className="store-product-info">
        <Link href={`/product/${product.slug}`} className="store-product-title">
          {product.name}
        </Link>
        <p className="premium-product-description">
          {product.shortDescription}
        </p>
        <div className="premium-card-purchase">
          <Price
            price={variant.price}
            compareAtPrice={variant.compareAtPrice}
            size="sm"
            className="min-w-0 flex-1 gap-1.5"
          />
          {product.variants.some((v) => v.colorHex) && (
            <div className="premium-card-swatches" aria-label="Product options">
              {product.variants
                .filter((v) => v.colorHex)
                .slice(0, 5)
                .map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    title={[v.color, v.material, v.capacity]
                      .filter(Boolean)
                      .join(" / ")}
                    aria-label={`Choose ${[v.color, v.material, v.capacity].filter(Boolean).join(" / ") || v.sku}`}
                    aria-pressed={variant.id === v.id}
                    onClick={() => setSelected(v.id)}
                    style={{ backgroundColor: v.colorHex }}
                  />
                ))}
            </div>
          )}
          <button
            type="button"
            onClick={add}
            disabled={outOfStock}
            aria-label={outOfStock ? "Out of stock" : "Add to Cart"}
            className="store-add-button"
          >
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
