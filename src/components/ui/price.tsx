import { discountPercent, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Price({
  price,
  compareAtPrice,
  size = "md",
  className,
}: PriceProps) {
  const percent = discountPercent(price, compareAtPrice);
  const priceSize =
    size === "lg"
      ? "text-2xl md:text-3xl"
      : size === "md"
        ? "text-lg"
        : "text-base";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-display font-bold text-navy-900", priceSize)}>
        {formatPrice(price)}
      </span>
      {percent > 0 && compareAtPrice && (
        <>
          <span className="text-sm text-navy-400 line-through">
            {formatPrice(compareAtPrice)}
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            {percent}% off
          </span>
        </>
      )}
    </div>
  );
}
