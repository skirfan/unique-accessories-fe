import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CatalogView } from "@/components/catalog/catalog-view";
import { SearchBox } from "@/components/search/search-box";
import { getCatalog } from "@/lib/server-catalog";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; device?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { getDeviceModelById, getProducts } = await getCatalog();
  const { q, device } = await searchParams;
  const deviceModel = device ? getDeviceModelById(device) : undefined;
  const hasQuery = Boolean(q?.trim()) || Boolean(deviceModel);

  const products = hasQuery
    ? getProducts({ query: q, deviceModelId: deviceModel?.id })
    : [];

  const heading = deviceModel
    ? `Accessories for ${deviceModel.brandName} ${deviceModel.name}`
    : q
      ? `Results for "${q}"`
      : "Search";

  return (
    <>
      <div className="border-b border-navy-100 bg-navy-50">
        <div className="container-app py-8">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Search" }]}
          />
          <h1 className="mt-3 font-display text-3xl font-bold text-navy-900">
            {heading}
          </h1>
          {hasQuery && (
            <p className="mt-2 text-sm text-navy-500">
              {products.length} products found
            </p>
          )}
          <SearchBox initialQuery={q ?? ""} />
        </div>
      </div>
      <div className="container-app py-10">
        {hasQuery ? (
          <Suspense>
            <CatalogView products={products} />
          </Suspense>
        ) : (
          <SearchPrompt />
        )}
      </div>
    </>
  );
}

async function SearchPrompt() {
  const { getCategories } = await getCatalog();
  const categories = getCategories();

  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-navy-100 bg-navy-50/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-navy-400 shadow-sm">
        <SearchIcon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-navy-900">
        Search our catalog
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-navy-500">
        Try a product name, like &ldquo;wireless earbuds&rdquo; or &ldquo;dash
        cam&rdquo; — or browse by category below.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="rounded-full border border-navy-100 bg-white px-4 py-2 text-xs font-semibold text-navy-700 transition-colors hover:border-accent-300 hover:text-accent-600"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
