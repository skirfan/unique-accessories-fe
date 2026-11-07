import { BadgeIndianRupee, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { getCatalog } from "@/lib/server-catalog";
import { formatPrice } from "@/lib/utils";

export async function TrustBar() {
  const { settings } = await getCatalog();
  const ITEMS = [
    {
      icon: Truck,
      title: "Free Shipping",
      desc: `From ${formatPrice(settings.freeShippingThreshold)}`,
    },
    { icon: RotateCcw, title: "Here to help", desc: "Personal store support" },
    {
      icon: ShieldCheck,
      title: "Easy Payment Options",
      desc: "COD and manual UPI",
    },
    {
      icon: BadgeIndianRupee,
      title: "Personal Assistance",
      desc: "WhatsApp store support",
    },
  ];
  return (
    <section className="premium-trust-bar border-b border-navy-100 bg-white">
      <div className="container-app grid grid-cols-2 gap-4 py-6 sm:gap-6 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
              <item.icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-display text-xs font-semibold sm:text-sm text-navy-900">
                {item.title}
              </p>
              <p className="text-[11px] text-navy-500 sm:text-xs">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
