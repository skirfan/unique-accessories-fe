import type { Metadata } from "next";
import { Mail, MessageCircle, ShoppingBag } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCatalog } from "@/lib/server-catalog";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Unique Accessories support team.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { settings } = await getCatalog();
  return (
    <div className="container-app py-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <h1 className="mt-3 font-display text-3xl font-bold text-navy-900 md:text-4xl">
        Get in Touch
      </h1>
      <p className="mt-3 max-w-xl text-sm text-navy-500">
        Questions about an order, a product fit, or a bulk purchase? Send us a
        message on WhatsApp and our team will help you.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-5">
          {settings.whatsappNumber && (
            <ContactInfo
              icon={MessageCircle}
              title="WhatsApp"
              value={`+${settings.whatsappNumber}`}
            />
          )}
          <ContactInfo
            icon={ShoppingBag}
            title="Order support"
            value="Keep your private order link handy when you contact us."
          />
        </div>
        <ContactForm />
      </div>
    </div>
  );
}

function ContactInfo({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Mail;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-navy-100 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          {title}
        </p>
        <p className="mt-0.5 text-sm font-medium text-navy-900">{value}</p>
      </div>
    </div>
  );
}
