"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewsSection } from "@/components/product/reviews-section";
import type { Product } from "@/types";

const TABS = ["Description", "Specifications", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<Tab>("Description");
  const baseId = useId();

  function handleKeyDown(e: React.KeyboardEvent) {
    const currentIndex = TABS.indexOf(active);
    let nextIndex: number | null = null;

    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % TABS.length;
    else if (e.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = TABS.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      const next = TABS[nextIndex];
      setActive(next);
      document.getElementById(`${baseId}-tab-${next}`)?.focus();
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product information"
        className="flex min-w-0 gap-1 overflow-x-auto border-b border-navy-100 sm:gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`${baseId}-tab-${tab}`}
            role="tab"
            aria-selected={active === tab}
            aria-controls={`${baseId}-panel-${tab}`}
            tabIndex={active === tab ? 0 : -1}
            type="button"
            onClick={() => setActive(tab)}
            onKeyDown={handleKeyDown}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-3 py-3 font-display text-xs font-semibold sm:px-4 sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1",
              active === tab
                ? "text-navy-900"
                : "text-navy-400 hover:text-navy-600",
            )}
          >
            {tab === "Reviews" ? `Reviews (${product.reviewCount})` : tab}
            {active === tab && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-500" />
            )}
          </button>
        ))}
      </div>

      <div className="py-6">
        {TABS.map((tab) =>
          tab === active ? (
            <div
              key={tab}
              id={`${baseId}-panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${tab}`}
              tabIndex={0}
            >
              {tab === "Description" && (
                <p className="max-w-2xl text-sm leading-relaxed text-navy-600">
                  {product.description}
                </p>
              )}
              {tab === "Specifications" && (
                <ul className="grid max-w-2xl gap-3 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-navy-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              {tab === "Reviews" && <ReviewsSection product={product} />}
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
