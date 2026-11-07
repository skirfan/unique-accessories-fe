import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductSelection } from "@/components/product/product-selection";
import { BuyBox } from "@/components/product/buy-box";
import { CompatibilityChecker } from "@/components/product/compatibility-checker";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductBadgeTag } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { ProductSection } from "@/components/home/product-section";
import { CarCampaign } from "@/components/home/car-campaign";
import { RecordRecentlyViewed } from "@/components/product/record-recently-viewed";
import { RecentlyViewedSection } from "@/components/product/recently-viewed-section";
import { getCatalog } from "@/lib/server-catalog";
import { formatPrice } from "@/lib/utils";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { CheckCheck, MessageCircle, ShieldCheck, Truck } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { getProductBySlug } = await getCatalog();
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const {
    getCategoryBySlug,
    getProductBySlug,
    getRelatedProducts,
    getSubcategoryBySlug,
    settings,
  } = await getCatalog();
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);
  const subcategory = getSubcategoryBySlug(product.subcategorySlug);
  const related = getRelatedProducts(product, 4);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    {
      label: category?.name ?? "Shop",
      href: `/category/${product.categorySlug}`,
    },
    {
      label: subcategory?.name ?? "",
      href: `/category/${product.categorySlug}/${product.subcategorySlug}`,
    },
    { label: product.name },
  ];

  return (
    <>
      <RecordRecentlyViewed productId={product.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)).replace(
            /</g,
            "\u003c",
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              breadcrumbItems.map((b) => ({
                label: b.label,
                href: b.href ?? `/product/${product.slug}`,
              })),
            ),
          ).replace(/</g, "\u003c"),
        }}
      />

      <div className="container-app py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <ProductSelection product={product}>
        <div className="container-app premium-product-layout">
          <ProductGallery product={product} />

          <div className="premium-product-details">
            <div className="mb-2 flex items-center gap-2">
              <ProductBadgeTag badge={product.badge} />
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <Rating value={product.rating} count={product.reviewCount} />
            </div>
            <p className="mt-4 text-sm text-navy-500">
              {product.shortDescription}
            </p>

            <div className="mt-6">
              <BuyBox product={product} />
            </div>

            <div className="mt-6">
              <CompatibilityChecker
                compatibleDeviceModelIds={product.compatibleDeviceModelIds}
              />
            </div>

            <div className="premium-product-service-list">
              <div className="flex items-center gap-2 text-xs text-navy-500">
                <Truck className="h-4 w-4 text-accent-500" /> Free shipping from{" "}
                {formatPrice(settings.freeShippingThreshold)}
              </div>
              <div className="flex items-center gap-2 text-xs text-navy-500">
                <MessageCircle className="h-4 w-4 text-accent-500" /> Personal
                support
              </div>
              <div className="flex items-center gap-2 text-xs text-navy-500">
                <ShieldCheck className="h-4 w-4 text-accent-500" /> Order
                confirmation
              </div>
            </div>
          </div>
        </div>
      </ProductSelection>
      <section
        className="container-app premium-product-highlights"
        aria-label="Shopping benefits"
      >
        {[
          { Icon: ShieldCheck, label: "Confirmed orders and clear payment details" },
          {
            Icon: Truck,
            label: `Free shipping from ${formatPrice(settings.freeShippingThreshold)}`,
          },
          { Icon: MessageCircle, label: "Personal WhatsApp support" },
          { Icon: CheckCheck, label: "Device compatibility guidance" },
        ].map(({ Icon, label }) => (
          <div key={label}>
            <Icon size={25} strokeWidth={1.2} />
            <span>{label}</span>
          </div>
        ))}
      </section>
      {product.categorySlug === "car-accessories" && <CarCampaign product />}
      <div className="container-app pb-16">
        <ProductTabs product={product} />
      </div>

      <ProductSection
        eyebrow="You may also like"
        title="Related Products"
        viewAllHref={`/category/${product.categorySlug}/${product.subcategorySlug}`}
        products={related}
      />

      <RecentlyViewedSection excludeProductId={product.id} />
    </>
  );
}
