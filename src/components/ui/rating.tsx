import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function Rating({ value, count, size = "sm", className }: RatingProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="flex items-center"
        role="img"
        aria-label={`${value.toFixed(1)} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, value - i));
          return (
            <span key={i} className="relative inline-block">
              <Star
                className={cn(starSize, "text-navy-100")}
                fill="currentColor"
              />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star
                    className={cn(starSize, "text-accent-500")}
                    fill="currentColor"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-navy-500">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
