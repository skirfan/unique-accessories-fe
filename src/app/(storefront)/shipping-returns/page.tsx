import { getCatalog } from "@/lib/server-catalog";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Package, RotateCcw, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping timelines, costs and the return policy for Unique Accessories orders.",
  alternates: { canonical: "/shipping-returns" },
};

export default async function ShippingReturnsPage() {
  const { settings } = await getCatalog();
  return (
    <div className="container-app max-w-3xl py-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Shipping & Returns" }]}
      />
      <h1 className="mt-3 font-display text-3xl font-bold text-navy-900 md:text-4xl">
        Shipping &amp; Returns
      </h1>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2 text-navy-900">
          <Truck className="h-5 w-5 text-accent-500" />
          <h2 className="font-display text-lg font-bold">Shipping</h2>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm text-navy-600">
          <li>
            Free shipping from {formatPrice(settings.freeShippingThreshold)}{" "}
            after discounts; a {formatPrice(settings.shippingFee)} fee applies
            below that.
          </li>
          <li>
            Delivery availability is checked when the store reviews your
            request. UPI orders are packed after payment verification.
          </li>
          <li>
            Standard delivery takes 3–7 business days depending on your
            location.
          </li>
          <li>
            Track your order using the private link provided after submitting
            your request.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2 text-navy-900">
          <RotateCcw className="h-5 w-5 text-accent-500" />
          <h2 className="font-display text-lg font-bold">Returns</h2>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm text-navy-600">
          <li>Returns are accepted within 7 days of delivery.</li>
          <li>
            Items must be unused, undamaged and in their original packaging.
          </li>
          <li>
            Refunds are processed to the original payment method within 5–7
            business days of the returned item passing inspection.
          </li>
          <li>
            Personal-fit items (screen protectors once applied) can only be
            returned if defective.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2 text-navy-900">
          <Package className="h-5 w-5 text-accent-500" />
          <h2 className="font-display text-lg font-bold">
            Damaged or incorrect items
          </h2>
        </div>
        <p className="text-sm text-navy-600">
          If an item arrives damaged or doesn&apos;t match your order, contact
          support within 48 hours of delivery with photos of the item and
          packaging, and we&apos;ll arrange a free replacement or refund.
        </p>
      </section>
    </div>
  );
}
