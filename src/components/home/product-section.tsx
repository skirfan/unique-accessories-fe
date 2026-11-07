import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/types";

interface ProductSectionProps {
  eyebrow: string;
  title: string;
  viewAllHref: string;
  products: Product[];
  tone?: "light" | "dark";
}

export function ProductSection({
  eyebrow,
  title,
  viewAllHref,
  products,
  tone = "light",
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      className={
        tone === "dark"
          ? "store-products-section bg-navy-50 py-12 md:py-16"
          : "store-products-section py-12 md:py-16"
      }
    >
      <div className="container-app">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="store-eyebrow">{eyebrow}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 md:text-3xl">
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="hidden items-center gap-1.5 font-display text-sm font-semibold text-navy-900 hover:text-accent-600 sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={products} />
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-navy-900"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
