import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Car, Heart, ShieldCheck, Smartphone } from "lucide-react";
import { getCatalog } from "@/lib/server-catalog";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Unique Accessories designs and curates mobile and car accessories built for exact device fit.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Fit-first",
    desc: "Every listing states exactly which phones or cars it's built for.",
  },
  {
    icon: Heart,
    title: "Built to last",
    desc: "We test for drops, heat and daily wear before anything goes on sale.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    desc: "Covers, audio and charging picked for how people actually use their phones.",
  },
  {
    icon: Car,
    title: "Road-ready",
    desc: "Car accessories chosen for real Indian roads and daily commutes.",
  },
];

export default async function AboutPage() {
  const { getAllProducts, getDeviceModels } = await getCatalog();
  const productCount = getAllProducts().length;
  const deviceModelCount = getDeviceModels().length;

  return (
    <div className="container-app py-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />
      <h1 className="mt-3 font-display text-3xl font-bold text-navy-900 md:text-4xl">
        Smart Accessories. Better Life.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-navy-600">
        Unique Accessories started with a simple frustration: buying a phone
        cover or car mount online and having no real way to know if it would
        actually fit. So we built a store where every product tells you exactly
        which phones or car models it&apos;s designed for, backed by accessories
        we&apos;d actually use ourselves.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-2xl border border-navy-100 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
              <v.icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <h3 className="mt-4 font-display text-sm font-semibold text-navy-900">
              {v.title}
            </h3>
            <p className="mt-1.5 text-sm text-navy-500">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-6 rounded-3xl bg-navy-950 p-10 text-white sm:grid-cols-3">
        <div>
          <p className="font-display text-3xl font-extrabold text-accent-400">
            {productCount}+
          </p>
          <p className="mt-1 text-sm text-navy-300">
            Products across mobile and car accessories
          </p>
        </div>
        <div>
          <p className="font-display text-3xl font-extrabold text-accent-400">
            {deviceModelCount}+
          </p>
          <p className="mt-1 text-sm text-navy-300">
            Phone and car models with verified fit
          </p>
        </div>
        <div>
          <p className="font-display text-3xl font-extrabold text-accent-400">
            7-day
          </p>
          <p className="mt-1 text-sm text-navy-300">
            Easy return window on every order
          </p>
        </div>
      </div>
    </div>
  );
}
