"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { ProductGrid } from "@/components/product/product-grid";
import { DeviceSelectFields } from "@/components/product/device-select-fields";
import { cn, getMinVariantPrice } from "@/lib/utils";
import { useDeviceSelector } from "@/lib/use-device-selector";
import type { Product, Subcategory } from "@/types";

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";

const PRICE_BANDS: { label: string; min: number; max: number }[] = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "Above ₹2,000", min: 2000, max: Infinity },
];

const PAGE_SIZE = 12;

interface CatalogViewProps {
  products: Product[];
  subcategoryOptions?: Subcategory[];
  categorySlug?: string;
}

export function CatalogView({
  products,
  subcategoryOptions = [],
}: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [subFilter, setSubFilter] = useState<string[]>(() =>
    (searchParams.get("sub") ?? "").split(",").filter(Boolean),
  );
  const [priceBand, setPriceBand] = useState<number | null>(() => {
    const value = searchParams.get("price");
    const raw = value === null ? NaN : Number(value);
    return Number.isInteger(raw) && raw >= 0 && raw < PRICE_BANDS.length
      ? raw
      : null;
  });
  const [badge, setBadge] = useState<string | null>(searchParams.get("badge"));
  const [sort, setSort] = useState<SortKey>(
    (searchParams.get("sort") as SortKey) ?? "relevance",
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterPanel = useRef<HTMLDivElement>(null);
  useFocusTrap(filterPanel, mobileFiltersOpen);
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", close);
    };
  }, [mobileFiltersOpen]);

  const deviceSelector = useDeviceSelector(
    searchParams.get("device") ?? undefined,
  );
  const { modelId: deviceModelId } = deviceSelector;

  // Keep the URL in sync with the current filters (shareable links, survives
  // reload/back-forward) without a full navigation/scroll reset.
  function syncUrl(next: {
    sub?: string[];
    price?: number | null;
    badge?: string | null;
    device?: string;
    sort?: SortKey;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const state = {
      sub: next.sub ?? subFilter,
      price: next.price !== undefined ? next.price : priceBand,
      badge: next.badge !== undefined ? next.badge : badge,
      device: next.device !== undefined ? next.device : deviceModelId,
      sort: next.sort ?? sort,
    };

    if (state.sub.length > 0) params.set("sub", state.sub.join(","));
    else params.delete("sub");

    if (state.price !== null) params.set("price", String(state.price));
    else params.delete("price");

    if (state.badge) params.set("badge", state.badge);
    else params.delete("badge");

    if (state.device) params.set("device", state.device);
    else params.delete("device");

    if (state.sort !== "relevance") params.set("sort", state.sort);
    else params.delete("sort");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const filtered = useMemo(() => {
    let result = [...products];

    if (subFilter.length > 0) {
      result = result.filter((p) => subFilter.includes(p.subcategorySlug));
    }
    if (badge) {
      result = result.filter((p) => p.badge === badge);
    }
    if (priceBand !== null) {
      const band = PRICE_BANDS[priceBand];
      result = result.filter((p) => {
        const price = getMinVariantPrice(p);
        return price >= band.min && price < band.max;
      });
    }
    if (deviceModelId) {
      result = result.filter(
        (p) =>
          p.compatibleDeviceModelIds.length === 0 ||
          p.compatibleDeviceModelIds.includes(deviceModelId),
      );
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => getMinVariantPrice(a) - getMinVariantPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => getMinVariantPrice(b) - getMinVariantPrice(a));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [products, subFilter, badge, priceBand, deviceModelId, sort]);

  // Reset pagination whenever the active filters/sort actually change.
  // Adjusted during render (not an effect) — see quantity-stepper.tsx for
  // the same pattern with a comment explaining why.
  const filterSignature = JSON.stringify({
    subFilter,
    badge,
    priceBand,
    deviceModelId,
    sort,
  });
  const [syncedSignature, setSyncedSignature] = useState(filterSignature);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  if (filterSignature !== syncedSignature) {
    setSyncedSignature(filterSignature);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleSub(slug: string) {
    const next = subFilter.includes(slug)
      ? subFilter.filter((s) => s !== slug)
      : [...subFilter, slug];
    setSubFilter(next);
    syncUrl({ sub: next });
  }

  function handlePriceBand(i: number) {
    const next = priceBand === i ? null : i;
    setPriceBand(next);
    syncUrl({ price: next });
  }

  function handleBadge(b: string) {
    const next = badge === b ? null : b;
    setBadge(next);
    syncUrl({ badge: next });
  }

  function handleDeviceModelChange(id: string) {
    deviceSelector.setModelId(id);
    syncUrl({ device: id });
  }

  function handleSort(next: SortKey) {
    setSort(next);
    syncUrl({ sort: next });
  }

  function clearAll() {
    setSubFilter([]);
    setPriceBand(null);
    setBadge(null);
    deviceSelector.setBrandId("");
    syncUrl({ sub: [], price: null, badge: null, device: "" });
  }

  const activeFilterCount =
    subFilter.length +
    (priceBand !== null ? 1 : 0) +
    (badge ? 1 : 0) +
    (deviceModelId ? 1 : 0);

  const sidebar = (
    <div className="flex flex-col gap-7">
      {subcategoryOptions.length > 0 && (
        <div>
          <p className="mb-3 font-display text-sm font-semibold text-navy-900">
            Category
          </p>
          <div className="flex flex-col gap-2">
            {subcategoryOptions.map((sub) => (
              <label
                key={sub.id}
                className="flex items-center gap-2.5 text-sm text-navy-600"
              >
                <input
                  type="checkbox"
                  checked={subFilter.includes(sub.slug)}
                  onChange={() => toggleSub(sub.slug)}
                  className="h-4 w-4 rounded border-navy-200 text-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500"
                />
                {sub.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 font-display text-sm font-semibold text-navy-900">
          Price
        </p>
        <div className="flex flex-col gap-2">
          {PRICE_BANDS.map((band, i) => (
            <label
              key={band.label}
              className="flex items-center gap-2.5 text-sm text-navy-600"
            >
              <input
                type="radio"
                name="price-band"
                checked={priceBand === i}
                onChange={() => handlePriceBand(i)}
                className="h-4 w-4 border-navy-200 text-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500"
              />
              {band.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 font-display text-sm font-semibold text-navy-900">
          Badge
        </p>
        <div className="flex flex-wrap gap-2">
          {["Bestseller", "New", "Sale"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => handleBadge(b)}
              aria-pressed={badge === b}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1",
                badge === b
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-navy-100 text-navy-600",
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 font-display text-sm font-semibold text-navy-900">
          Fits my device
        </p>
        <DeviceSelectFields
          selector={{ ...deviceSelector, setModelId: handleDeviceModelChange }}
          size="sm"
          labelPrefix="Filter by device"
        />
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-left text-xs font-semibold text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="premium-catalog">
      {subcategoryOptions.length > 0 && (
        <div
          className="premium-category-chips"
          role="group"
          aria-label="Product categories"
        >
          <button
            type="button"
            aria-pressed={subFilter.length === 0}
            onClick={() => {
              setSubFilter([]);
              syncUrl({ sub: [] });
            }}
          >
            All
          </button>
          {subcategoryOptions.map((sub) => (
            <button
              type="button"
              key={sub.id}
              aria-pressed={subFilter.includes(sub.slug)}
              onClick={() => {
                const next =
                  subFilter.length === 1 && subFilter[0] === sub.slug
                    ? []
                    : [sub.slug];
                setSubFilter(next);
                syncUrl({ sub: next });
              }}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
      <div className="premium-catalog-toolbar">
        <p>{filtered.length} Products</p>
        <div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="premium-filter-trigger"
          >
            <SlidersHorizontal size={15} /> Filters
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
          <label className="premium-sort-label">
            <span>Sort by</span>
            <select
              value={sort}
              aria-label="Sort products"
              onChange={(event) => handleSort(event.target.value as SortKey)}
            >
              <option value="relevance">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </label>
        </div>
      </div>
      <ProductGrid products={visibleProducts} columns={3} />
      {hasMore && (
        <div className="premium-load-more">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Load more products
          </button>
          <p>
            Showing {Math.min(visibleCount, filtered.length)} of{" "}
            {filtered.length} products
          </p>
        </div>
      )}
      {mobileFiltersOpen && (
        <div className="premium-filter-overlay fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-navy-950/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            ref={filterPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="premium-filter-panel absolute right-0 top-0 h-dvh w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg font-bold text-navy-900">
                Filters
              </p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-navy-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
