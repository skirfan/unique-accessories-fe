"use client";

import { Car, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeviceSelector } from "@/lib/use-device-selector";
import type { DeviceType } from "@/types";

interface DeviceSelectFieldsProps {
  selector: DeviceSelector;
  size?: "sm" | "md";
  /** Accessible label prefix, e.g. "Filter by device" — announced to screen readers only. */
  labelPrefix?: string;
}

const SIZE_CLASSES = {
  sm: {
    toggle: "py-1.5 text-xs",
    icon: "h-3.5 w-3.5",
    select: "rounded-lg px-2.5 py-2 text-xs",
  },
  md: {
    toggle: "py-3 text-sm",
    icon: "h-4 w-4",
    select: "rounded-xl px-3 py-2.5 text-sm",
  },
} as const;

/** The "Phone / Car" toggle + cascading Brand/Model selects shared by the
 * homepage device finder, the PDP compatibility checker, and the catalog
 * sidebar filter. */
export function DeviceSelectFields({
  selector,
  size = "sm",
  labelPrefix,
}: DeviceSelectFieldsProps) {
  const {
    type,
    setType,
    brandId,
    setBrandId,
    modelId,
    setModelId,
    brands,
    models,
  } = selector;
  const s = SIZE_CLASSES[size];

  return (
    <div>
      <div
        className="mb-2 flex gap-2"
        role="group"
        aria-label={
          labelPrefix ? `${labelPrefix} — device type` : "Device type"
        }
      >
        {(["PHONE", "CAR"] as DeviceType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors",
              s.toggle,
              type === t
                ? "bg-navy-900 text-white"
                : "bg-navy-50 text-navy-500",
            )}
          >
            {t === "PHONE" ? (
              <Smartphone className={s.icon} />
            ) : (
              <Car className={s.icon} />
            )}
            {t === "PHONE" ? "Phone" : "Car"}
          </button>
        ))}
      </div>
      <div className={cn("grid gap-2", size === "md" && "sm:grid-cols-2")}>
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          aria-label={labelPrefix ? `${labelPrefix} — brand` : "Brand"}
          className={cn(
            "w-full border border-navy-100 bg-white text-navy-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus:border-accent-400",
            s.select,
          )}
        >
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          disabled={!brandId}
          aria-label={labelPrefix ? `${labelPrefix} — model` : "Model"}
          className={cn(
            "w-full border border-navy-100 bg-white text-navy-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus:border-accent-400 disabled:bg-navy-50 disabled:text-navy-300",
            s.select,
          )}
        >
          <option value="">Select model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
