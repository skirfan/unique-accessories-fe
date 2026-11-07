import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { WishlistContent } from "@/components/product/wishlist-content";

export const metadata: Metadata = {
  title: "Your Wishlist",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="container-app py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />
      <h1 className="mt-3 mb-8 font-display text-3xl font-bold text-navy-900">
        Your Wishlist
      </h1>
      <WishlistContent />
    </div>
  );
}
