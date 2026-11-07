"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DeviceSelectFields } from "@/components/product/device-select-fields";
import { useDeviceSelector } from "@/lib/use-device-selector";

export function DeviceFinder() {
  const router = useRouter();
  const selector = useDeviceSelector();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selector.modelId) return;
    router.push(`/search?device=${selector.modelId}`);
  }

  return (
    <section className="premium-device-finder bg-navy-50 py-16 md:py-20">
      <div className="container-app grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-accent-600">
            Fit-checked, not guesswork
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 md:text-3xl">
            Find accessories made for your exact device
          </h2>
          <p className="mt-3 max-w-md text-sm text-navy-500">
            Every cover, mount and screen protector lists the phones and cars
            it&apos;s built for. Tell us what you drive or carry, and we&apos;ll
            show you what actually fits.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-navy-100 bg-white p-6 shadow-lg shadow-navy-900/5 md:p-8"
        >
          <DeviceSelectFields
            selector={selector}
            size="md"
            labelPrefix="Find my accessories"
          />

          <button
            type="submit"
            disabled={!selector.modelId}
            className={buttonVariants({
              variant: "primary",
              className: "mt-6 w-full disabled:opacity-40",
            })}
          >
            <Search className="h-4 w-4" /> Find My Accessories
          </button>
        </form>
      </div>
    </section>
  );
}
