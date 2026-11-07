import { Suspense } from "react";
import type { Metadata } from "next";
import { CollectionHeader } from "@/components/catalog/collection-header";
import { CatalogView } from "@/components/catalog/catalog-view";
import { getCatalog } from "@/lib/server-catalog";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse the full Unique Accessories catalog of mobile and car accessories.",
  alternates: { canonical: "/products" },
};

export default async function AllProductsPage() {
  const { getAllProducts, getSubcategories } = await getCatalog();
  const products = getAllProducts();
  const subcategories = getSubcategories();

  return (
    <>
      <CollectionHeader
        title="Shop the Collection"
        description="Smart accessories for a connected lifestyle."
        cover={products.find((p) => p.images?.length)}
      />
      <div className="container-app py-10">
        <Suspense>
          <CatalogView products={products} subcategoryOptions={subcategories} />
        </Suspense>
      </div>
    </>
  );
}
