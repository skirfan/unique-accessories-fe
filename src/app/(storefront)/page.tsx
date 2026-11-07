import { CarCampaign } from "@/components/home/car-campaign";
import { Hero } from "@/components/home/hero";
import { TrustBar } from "@/components/home/trust-bar";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { DeviceFinder } from "@/components/home/device-finder";
import { ProductSection } from "@/components/home/product-section";
import { OrderSteps } from "@/components/home/order-steps";
import { RecentlyViewedSection } from "@/components/product/recently-viewed-section";
import { getCatalog } from "@/lib/server-catalog";

export default async function HomePage() {
  const {
    getDealsProducts,
    getFeaturedProducts,
    getNewArrivals,
    getAllProducts,
  } = await getCatalog();
  const favourites = getFeaturedProducts(8);
  const featured = favourites.length
    ? favourites
    : getAllProducts().slice(0, 8);
  const newArrivals = getNewArrivals(8);
  const deals = getDealsProducts(4);

  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryShowcase />
      <CarCampaign />
      <ProductSection
        eyebrow="Customer favourites"
        title="Everyday Essentials"
        viewAllHref="/products"
        products={featured}
      />
      <DeviceFinder />
      <ProductSection
        eyebrow="Just landed"
        title="New Arrivals"
        viewAllHref="/products?badge=New"
        products={newArrivals}
      />
      {deals.length > 0 && (
        <ProductSection
          eyebrow="Limited time"
          title="Today's Deals"
          viewAllHref="/products?badge=Sale"
          products={deals}
          tone="dark"
        />
      )}
      <OrderSteps />
      <RecentlyViewedSection />
    </>
  );
}
