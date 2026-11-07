"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeviceSelector } from "@/lib/use-device-selector";
import { DeviceSelectFields } from "@/components/product/device-select-fields";

interface CompatibilityCheckerProps {
  compatibleDeviceModelIds: string[];
}

export function CompatibilityChecker({
  compatibleDeviceModelIds,
}: CompatibilityCheckerProps) {
  const universal = compatibleDeviceModelIds.length === 0;
  const selector = useDeviceSelector();
  const result = selector.modelId
    ? compatibleDeviceModelIds.includes(selector.modelId)
    : null;

  if (universal) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        <Check className="h-4 w-4" /> Universal fit — works with any phone and
        case
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-navy-100 p-4">
      <p className="mb-3 text-sm font-semibold text-navy-900">
        Check compatibility with your device
      </p>
      <DeviceSelectFields
        selector={selector}
        size="sm"
        labelPrefix="Check compatibility"
      />

      {result !== null && (
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
            result
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600",
          )}
        >
          {result ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {result
            ? "Fits your device perfectly"
            : "This won't fit the selected device"}
        </div>
      )}
    </div>
  );
}
