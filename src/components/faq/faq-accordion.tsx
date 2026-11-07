"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="flex flex-col divide-y divide-navy-100 rounded-2xl border border-navy-100">
      {items.map((item, i) => (
        <div key={item.question}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`${baseId}-panel-${i}`}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1"
          >
            <span className="font-display text-sm font-semibold text-navy-900">
              {item.question}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-navy-400 transition-transform",
                open === i && "rotate-180",
              )}
            />
          </button>
          {open === i && (
            <p
              id={`${baseId}-panel-${i}`}
              role="region"
              className="px-5 pb-4 text-sm text-navy-500"
            >
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
