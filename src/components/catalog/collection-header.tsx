import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductVisual } from "@/components/product/product-visual";
import { getProductVisual } from "@/lib/product-images";
import type { Product } from "@/types";
export function CollectionHeader({
  title,
  description,
  cover,
  car = false,
}: {
  title: string;
  description: string;
  cover?: Product;
  car?: boolean;
}) {
  return (
    <section className="premium-collection-header">
      <div className="container-app premium-collection-inner">
        <div className="premium-collection-copy">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: title }]}
          />
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="premium-collection-art" aria-hidden="true">
          {cover ? (
            <ProductVisual
              visual={getProductVisual(cover, undefined, true)}
              label=""
              className="h-full w-full rounded-none"
            />
          ) : (
            <div
              className={`premium-collection-study ${car ? "is-car" : "is-mobile"}`}
            />
          )}
        </div>
      </div>
    </section>
  );
}
