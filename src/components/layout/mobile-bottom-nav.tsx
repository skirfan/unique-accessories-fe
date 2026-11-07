"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, House, UserRound, ShoppingBag } from "lucide-react";
import { selectItemCount, useCartStore } from "@/store/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";
export function MobileBottomNav() {
  const path = usePathname();
  const open = useCartStore((s) => s.openDrawer);
  const count = useCartStore((s) => selectItemCount(s.lines));
  const mounted = useHasMounted();
  return (
    <nav className="premium-bottom-nav" aria-label="Mobile shopping navigation">
      <Link href="/" aria-current={path === "/" ? "page" : undefined}>
        <House size={19} strokeWidth={1.5} />
        <span>Shop</span>
      </Link>
      <Link
        href="/categories"
        aria-current={path.startsWith("/categor") ? "page" : undefined}
      >
        <Grid2X2 size={19} strokeWidth={1.5} />
        <span>Categories</span>
      </Link>
      <button onClick={open} aria-label="Open cart">
        <span className="premium-bottom-bag">
          <ShoppingBag size={19} strokeWidth={1.5} />
          {mounted && count > 0 && <i>{count}</i>}
        </span>
        <span>Cart</span>
      </button>
      <Link
        href="/account"
        aria-current={path === "/account" ? "page" : undefined}
      >
        <UserRound size={19} strokeWidth={1.5} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
