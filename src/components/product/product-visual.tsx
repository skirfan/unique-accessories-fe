"use client";
import { useState } from "react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ProductVisual as ProductVisualType } from "@/types";

interface ProductVisualProps {
  visual: ProductVisualType;
  label?: string;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
}

export function ProductVisual({
  visual,
  label,
  className,
  iconClassName,
  priority,
}: ProductVisualProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const Icon = getIcon(visual.icon);
  if (visual.imageUrl && failedUrl !== visual.imageUrl)
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50",
          className,
        )}
      >
        {/* Images are already resized/optimized by the managed media pipeline. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.imageUrl}
          alt={label ?? "Product photo"}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailedUrl(visual.imageUrl ?? null)}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    );

  return (
    <div
      role="img"
      aria-label={label ?? "Product image placeholder"}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400",
        className,
      )}
    >
      {/* eslint-disable-next-line react-hooks/static-components -- `Icon` is looked up from a stable, module-level registry (src/lib/icons.tsx), not created per render */}
      <Icon
        className={cn("relative h-10 w-10 text-slate-400", iconClassName)}
        strokeWidth={1.6}
      />
    </div>
  );
}
