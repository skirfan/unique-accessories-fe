import { BadgeCheck } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import type { Product } from "@/types";

export function ReviewsSection({ product }: { product: Product }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-navy-900">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-sm text-navy-400">/ 5</span>
        </div>
        <div>
          <Rating value={product.rating} size="md" />
          <p className="mt-1 text-xs text-navy-400">
            Based on {product.reviewCount} ratings
          </p>
        </div>
      </div>

      {product.reviews.length === 0 ? (
        <p className="rounded-xl bg-navy-50 px-4 py-6 text-center text-sm text-navy-500">
          No written reviews yet for this product.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {product.reviews.map((review) => (
            <li
              key={review.id}
              className="border-b border-navy-50 pb-5 last:border-none"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-navy-900">
                  {review.author}
                </p>
                <span className="text-xs text-navy-400">{review.date}</span>
              </div>
              <Rating value={review.rating} className="mt-1.5" />
              <p className="mt-2 text-sm font-semibold text-navy-800">
                {review.title}
              </p>
              <p className="mt-1 text-sm text-navy-600">{review.comment}</p>
              {review.verified && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified purchase
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
