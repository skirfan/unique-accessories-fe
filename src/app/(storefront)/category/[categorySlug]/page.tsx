import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionHeader } from "@/components/catalog/collection-header";
import { CatalogView } from "@/components/catalog/catalog-view";
import { getCatalog } from "@/lib/server-catalog";
import { breadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { getCategoryBySlug } = await getCatalog();
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { getCategoryBySlug, getProducts, getSubcategories } =
    await getCatalog();
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const subcategories = getSubcategories(category.slug);
  const products = getProducts({ categorySlug: category.slug });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { label: "Home", href: "/" },
              { label: category.name, href: `/category/${category.slug}` },
            ]),
          ),
        }}
      />

      <CollectionHeader
        title={category.name}
        description={category.description}
        cover={products.find((p) => p.images?.length)}
        car={category.slug === "car-accessories"}
      />

      <div className="container-app py-10">
        <Suspense>
          <CatalogView
            products={products}
            subcategoryOptions={subcategories}
            categorySlug={category.slug}
          />
        </Suspense>
      </div>
    </>
  );
}
