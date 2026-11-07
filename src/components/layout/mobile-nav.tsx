"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Heart, Search, ShoppingBag, X } from "lucide-react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/use-focus-trap";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { getCategories, getSubcategories } = useCatalog();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const categories = getCategories();
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
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
        aria-label="Menu"
        className={`premium-mobile-menu absolute left-0 top-0 flex h-dvh w-full max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <Link href="/" onClick={onClose} className="store-wordmark">
            <span>
              UNIQUE<strong>ACCESSORIES</strong>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-navy-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative px-5 py-4">
          <Search className="pointer-events-none absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full rounded-full border border-navy-100 bg-navy-50/60 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus:border-accent-400"
          />
        </form>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <Link
            href="/products"
            onClick={onClose}
            className="premium-menu-link"
          >
            Shop all accessories
          </Link>
          <Link
            href="/categories"
            onClick={onClose}
            className="premium-menu-link"
          >
            Categories
          </Link>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border-b border-navy-50 last:border-none"
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === cat.slug ? null : cat.slug)
                }
                aria-expanded={expanded === cat.slug}
                aria-controls={`mobile-nav-panel-${cat.slug}`}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-display text-sm font-semibold text-navy-900"
              >
                {cat.name}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-navy-400 transition-transform",
                    expanded === cat.slug && "rotate-180",
                  )}
                />
              </button>
              {expanded === cat.slug && (
                <div
                  id={`mobile-nav-panel-${cat.slug}`}
                  className="flex flex-col gap-0.5 pb-2 pl-3"
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-accent-600"
                  >
                    Shop all {cat.name}
                  </Link>
                  {getSubcategories(cat.slug).map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/category/${cat.slug}/${sub.slug}`}
                      onClick={onClose}
                      className="rounded-lg px-3 py-2 text-sm text-navy-600 hover:bg-navy-50"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/products?badge=Sale"
            onClick={onClose}
            className="mt-2 block rounded-lg px-3 py-3 font-display text-sm font-semibold text-accent-600"
          >
            Deals
          </Link>
          <Link href="/about" onClick={onClose} className="premium-menu-link">
            About us
          </Link>
          <Link href="/contact" onClick={onClose} className="premium-menu-link">
            Help &amp; support
          </Link>
        </nav>

        <div className="flex items-center gap-2 border-t border-navy-100 px-5 py-4">
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-navy-100 py-2.5 text-sm font-semibold text-navy-800"
          >
            <Heart className="h-4 w-4" /> Wishlist
          </Link>
          <Link
            href="/cart"
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-navy-100 py-2.5 text-sm font-semibold text-navy-800"
          >
            <ShoppingBag className="h-4 w-4" /> Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
