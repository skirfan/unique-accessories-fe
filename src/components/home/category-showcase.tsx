import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCatalog } from "@/lib/server-catalog";
import { getProductVisual } from "@/lib/product-images";
import { ProductVisual } from "@/components/product/product-visual";
const cards = [
  {
    slug: "mobile-accessories",
    title: "Mobile Accessories",
    sub: undefined,
    theme: "mobile",
  },
  {
    slug: "car-accessories",
    title: "Car Accessories",
    sub: undefined,
    theme: "car",
  },
  {
    slug: "mobile-accessories",
    title: "Chargers & Power",
    sub: "chargers-adapters",
    theme: "power",
  },
  {
    slug: "mobile-accessories",
    title: "Audio & Earbuds",
    sub: "earphones-headphones",
    theme: "audio",
  },
];
export async function CategoryShowcase() {
  const { getProducts, getSubcategories } = await getCatalog();
  return (
    <section
      id="shop-categories"
      className="container-app store-category-section"
    >
      <div className="store-section-heading">
        <div>
          <h2>Shop by Category</h2>
          <p>Discover accessories crafted for your lifestyle.</p>
        </div>
        <Link href="/categories">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="premium-category-grid">
        {cards.map((card) => {
          const subs = getSubcategories(card.slug);
          const sub = card.sub
            ? (subs.find((s) => s.slug === card.sub) ??
              subs.find((s) =>
                card.theme === "power"
                  ? /charg|power/i.test(s.name)
                  : /audio|ear|head/i.test(s.name),
              ))
            : undefined;
          const products = getProducts({
            categorySlug: card.slug,
            ...(sub ? { subcategorySlug: sub.slug } : {}),
          });
          const cover = products.find((p) => p.images?.length);
          const href = sub
            ? `/category/${card.slug}/${sub.slug}`
            : `/category/${card.slug}`;
          return (
            <Link
              href={href}
              key={card.theme}
              className={`premium-category-card is-${card.theme}`}
            >
              {cover ? (
                <ProductVisual
                  visual={getProductVisual(cover, undefined, true)}
                  label={card.title}
                  className="premium-category-image is-uploaded"
                />
              ) : (
                <div
                  className={`premium-category-atlas is-${card.theme}`}
                  aria-hidden="true"
                />
              )}
              <div className="premium-category-shade" />
              <div className="premium-category-caption">
                <h3>{card.title}</h3>
                <span>
                  Explore <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
