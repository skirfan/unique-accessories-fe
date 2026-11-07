import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy-100 bg-navy-50/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-navy-400 shadow-sm">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-semibold text-navy-900">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-navy-500">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={buttonVariants({ variant: "primary", className: "mt-6" })}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
