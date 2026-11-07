"use client";

import Link from "next/link";
import { useCustomer } from "@/components/providers/customer-provider";
import { useHasMounted } from "@/lib/use-has-mounted";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCatalog } from "@/components/providers/catalog-provider";

export function WishlistContent() {
  const mounted = useHasMounted();
  const { user, error, loading } = useCustomer();
  const { getAllProducts } = useCatalog();
  const productIds = useWishlistStore((s) => s.productIds);
  const products = getAllProducts().filter((p) => productIds.includes(p.id));

  if (!mounted)
    return <p className="py-10 text-navy-500">Loading your wishlist…</p>;
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart icon on any product to save it here for later."
        actionLabel="Explore Products"
        actionHref="/products"
      />
    );
  }

  return (
    <>
      {!loading && (
        <p className="mb-6 rounded-lg bg-navy-50 p-4 text-sm text-navy-600">
          {error ? (
            error
          ) : user ? (
            "Your wishlist is saved to your account."
          ) : (
            <>
              Your wishlist is saved on this device.{" "}
              <Link className="underline" href="/login?next=/wishlist">
                Sign in with Google
              </Link>{" "}
              to keep it across devices.
            </>
          )}
        </p>
      )}
      <ProductGrid products={products} />
    </>
  );
}
