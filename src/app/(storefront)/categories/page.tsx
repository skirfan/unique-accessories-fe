import type { Metadata } from "next";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { CarCampaign } from "@/components/home/car-campaign";
export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Explore mobile accessories, car essentials, audio and charging collections.",
  alternates: { canonical: "/categories" },
};
export default function CategoriesPage() {
  return (
    <div className="premium-categories-page">
      <CategoryShowcase />
      <CarCampaign />
    </div>
  );
}
