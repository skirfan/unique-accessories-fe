import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false, follow: true },
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container-app max-w-3xl py-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      />
      <h1 className="mt-3 font-display text-3xl font-bold text-navy-900">
        Terms of Service
      </h1>
      <p className="mt-3 rounded-lg bg-accent-50 px-4 py-3 text-xs font-medium text-accent-700">
        Placeholder template — have this reviewed by legal counsel and updated
        with your business details before publishing live.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-navy-600">
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Unique Accessories website and placing an
            order, you agree to be bound by these Terms of Service and our
            Privacy Policy.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            2. Orders &amp; Payment
          </h2>
          <p>
            All orders are subject to product availability. Prices are listed in
            Indian Rupees (₹) and include applicable taxes unless stated
            otherwise. We reserve the right to refuse or cancel any order at our
            discretion, including in cases of pricing errors or suspected fraud.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            3. Shipping &amp; Delivery
          </h2>
          <p>
            Estimated delivery timelines are provided at checkout and on our
            Shipping &amp; Returns page. Delays caused by courier partners or
            circumstances outside our control are not guaranteed against.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            4. Returns &amp; Refunds
          </h2>
          <p>
            Returns and refunds are governed by our Shipping &amp; Returns
            policy, available on this website.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            5. Product Information
          </h2>
          <p>
            We aim to display product details, including device compatibility,
            as accurately as possible. We do not warrant that product
            descriptions are error-free and reserve the right to correct
            inaccuracies at any time.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            6. Limitation of Liability
          </h2>
          <p>
            Unique Accessories is not liable for any indirect, incidental or
            consequential damages arising from the use of our products or
            website, to the fullest extent permitted by law.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            7. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            website after changes are posted constitutes acceptance of the
            updated Terms.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            8. Contact
          </h2>
          <p>Questions about these Terms can be sent via our Contact page.</p>
        </section>
      </div>
    </div>
  );
}
