import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold font-display",
  {
    variants: {
      variant: {
        bestseller: "bg-navy-900 text-white",
        new: "bg-teal-600 text-white",
        sale: "bg-accent-500 text-white",
        outline: "border border-navy-100 text-navy-700 bg-white",
        soft: "bg-navy-50 text-navy-700",
        success: "bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: { variant: "soft" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function ProductBadgeTag({
  badge,
}: {
  badge: "Bestseller" | "New" | "Sale" | null;
}) {
  if (!badge) return null;
  const variant =
    badge === "Bestseller" ? "bestseller" : badge === "New" ? "new" : "sale";
  return <Badge variant={variant}>{badge}</Badge>;
}
