import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CatalogView } from "@/components/catalog/catalog-view";
import { getCatalog } from "@/lib/server-catalog";
import { breadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
}): Promise<Metadata> {
  const { getSubcategoryBySlug } = await getCatalog();
  const { subcategorySlug } = await params;
  const subcategory = getSubcategoryBySlug(subcategorySlug);
  if (!subcategory) return {};
  return {
    title: subcategory.name,
    description: subcategory.description,
    alternates: {
      canonical: `/category/${subcategory.categorySlug}/${subcategory.slug}`,
    },
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
}) {
  const { getCategoryBySlug, getProducts, getSubcategoryBySlug } =
    await getCatalog();
  const { categorySlug, subcategorySlug } = await params;
  const subcategory = getSubcategoryBySlug(subcategorySlug);
  const category = getCategoryBySlug(categorySlug);

  if (!subcategory || !category || subcategory.categorySlug !== categorySlug)
    notFound();

  const products = getProducts({
    categorySlug: category.slug,
    subcategorySlug: subcategory.slug,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { label: "Home", href: "/" },
              { label: category.name, href: `/category/${category.slug}` },
              {
                label: subcategory.name,
                href: `/category/${category.slug}/${subcategory.slug}`,
              },
            ]),
          ),
        }}
      />

      <div className="border-b border-navy-100 bg-navy-50">
        <div className="container-app py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: category.name, href: `/category/${category.slug}` },
              { label: subcategory.name },
            ]}
          />
          <h1 className="mt-3 font-display text-3xl font-bold text-navy-900">
            {subcategory.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-navy-500">
            {subcategory.description}
          </p>
        </div>
      </div>

      <div className="container-app py-10">
        <Suspense>
          <CatalogView products={products} />
        </Suspense>
      </div>
    </>
  );
}
