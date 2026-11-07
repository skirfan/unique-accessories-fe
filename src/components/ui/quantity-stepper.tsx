"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  className,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState(String(value));
  // Track the last `value` we synced from, so an external change (the +/-
  // buttons, or the cart store clamping to stock) is reflected in the text
  // field. Adjusted during render rather than via a useEffect + setState,
  // per React's guidance for "state that resets when a prop changes".
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(String(value));
  }

  function commit(raw: string) {
    const parsed = Number.parseInt(raw, 10);
    const next = Number.isFinite(parsed)
      ? Math.min(max, Math.max(min, parsed))
      : value;
    setDraft(String(next));
    if (next !== value) onChange(next);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-navy-100",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full text-navy-600 transition-colors hover:bg-navy-50 disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label="Quantity"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(e.currentTarget.value);
          }
        }}
        className="w-8 rounded bg-transparent text-center text-sm font-semibold text-navy-900 outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      />
      {/* Screen-reader-only announcement for changes triggered by the +/-
          buttons, which don't move focus into the field above. */}
      <span className="sr-only" aria-live="polite">
        Quantity: {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full text-navy-600 transition-colors hover:bg-navy-50 disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
