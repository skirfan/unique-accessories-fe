"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X, UserRound } from "lucide-react";
import { useCartStore, selectItemCount } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useCustomer } from "@/components/providers/customer-provider";
import { cn } from "@/lib/utils";
const links = [
  { label: "Shop", href: "/products" },
  { label: "Mobile", href: "/category/mobile-accessories" },
  { label: "Car", href: "/category/car-accessories" },
  { label: "Deals", href: "/products?badge=Sale" },
  { label: "About", href: "/about" },
];
export function Header() {
  const path = usePathname();
  const { user } = useCustomer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartOpen = useCartStore((s) => s.drawerOpen),
    openCart = useCartStore((s) => s.openDrawer),
    closeCart = useCartStore((s) => s.closeDrawer);
  const mounted = useHasMounted(),
    itemCount = useCartStore((s) => selectItemCount(s.lines)),
    wishlistCount = useWishlistStore((s) => s.productIds.length);
  return (
    <>
      <header className="store-header">
        <div className="container-app store-header-inner">
          <button
            type="button"
            className="premium-menu-trigger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={21} strokeWidth={1.5} />
          </button>
          <Link
            href="/"
            className="store-wordmark"
            aria-label="Unique Accessories home"
          >
            <span>
              UNIQUE<strong>ACCESSORIES</strong>
            </span>
          </Link>
          <nav className="premium-desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={path === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="premium-header-actions">
            <Link href="/search" aria-label="Search">
              <Search size={20} strokeWidth={1.4} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="premium-header-wishlist"
            >
              <Heart size={20} strokeWidth={1.4} />
              {mounted && wishlistCount > 0 && <i>{wishlistCount}</i>}
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "My account" : "Sign in"}
            >
              <UserRound size={20} strokeWidth={1.4} />
            </Link>
            <button type="button" aria-label="Open cart" onClick={openCart}>
              <ShoppingBag size={20} strokeWidth={1.4} />
              {mounted && itemCount > 0 && <i>{itemCount}</i>}
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </>
  );
}
export function CloseIconButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-navy-50",
      )}
    >
      <X className="h-5 w-5" />
    </button>
  );
}
