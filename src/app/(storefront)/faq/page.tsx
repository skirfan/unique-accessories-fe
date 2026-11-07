import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqAccordion } from "@/components/faq/faq-accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about orders, shipping, returns and product fit.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    question: "Where can I view my orders and invoice?",
    answer:
      "Sign in with Google and open My account to see orders placed while signed in. A guest can return through the private order link and save that order to an account with the same verified email. Invoice PDFs are available on the order page.",
  },
  {
    question: "How do I know an accessory will fit my phone or car?",
    answer:
      'Every product page has a compatibility checker — select your phone or car brand and model, and we\'ll confirm whether that specific product fits. Products marked "Universal fit" work with any device.',
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Checkout shows the available payment options: Cash on Delivery or manual UPI. Confirmed UPI orders show a QR code, recipient details and the exact amount on the order page. Submit your UTR after paying; the store verifies receipt before shipping.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most orders are packed within 24 hours and delivered within 3–7 business days depending on your location. You can track every order from the order confirmation page.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Items can be returned within 7 days of delivery if unused and in original packaging. See our Shipping & Returns page for the full policy.",
  },
  {
    question: "Do you offer Cash on Delivery everywhere?",
    answer:
      "Select Cash on Delivery when offered at checkout. Delivery depends on courier serviceability for your PIN code; contact the store if you need confirmation.",
  },
  {
    question: "Can I change or cancel my order after placing it?",
    answer:
      "Contact the store to request cancellation before shipment. Contact support with your order number as soon as possible and we'll do our best to help.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-app max-w-3xl py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <h1 className="mt-3 font-display text-3xl font-bold text-navy-900 md:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-sm text-navy-500">
        Can&apos;t find what you&apos;re looking for?{" "}
        <a href="/contact" className="text-accent-600 underline">
          Contact our team
        </a>
        .
      </p>
      <div className="mt-8">
        <FaqAccordion items={FAQS} />
      </div>
    </div>
  );
}
