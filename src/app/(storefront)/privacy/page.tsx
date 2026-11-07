import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: true },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container-app max-w-3xl py-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />
      <h1 className="mt-3 font-display text-3xl font-bold text-navy-900">
        Privacy Policy
      </h1>
      <p className="mt-3 rounded-lg bg-accent-50 px-4 py-3 text-xs font-medium text-accent-700">
        Placeholder template — have this reviewed by legal counsel and updated
        to reflect your actual data practices (payment processor, analytics,
        email provider) before publishing live.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-navy-600">
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly, such as your name,
            email, phone number and shipping address when you place an order,
            create an account, or contact support. Google sign-in provides a
            verified identity, email, name and profile picture.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to process and deliver orders, communicate
            order and shipping updates, respond to support requests, and — where
            you&apos;ve opted in — send offers and product updates.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            3. Payment Information
          </h2>
          <p>
            Checkout offers the configured Cash on Delivery and manual UPI
            options. We store payment status and any UPI transaction reference
            you submit for verification. We do not collect full card or banking
            credentials.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            4. Cookies
          </h2>
          <p>
            We use cookies and browser storage to keep you signed in, remember
            your cart and wishlist, and understand how our website is used.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            5. Data Sharing
          </h2>
          <p>
            We share information with logistics partners to deliver your order
            including Shiprocket when used to arrange shipping. We do not sell
            your personal information to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            6. Your Rights
          </h2>
          <p>
            You can request access to, correction of, or deletion of your
            personal data at any time by contacting us through our Contact page.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-navy-900">
            7. Changes to This Policy
          </h2>
          <p>
            We may update this policy periodically. Material changes will be
            reflected on this page.
          </p>
        </section>
      </div>
    </div>
  );
}
