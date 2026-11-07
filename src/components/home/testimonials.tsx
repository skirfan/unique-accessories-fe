import { Quote } from "lucide-react";
import { Rating } from "@/components/ui/rating";

// Template copy standing in for real customer reviews — there is no real
// review data yet since the store hasn't launched. Wire this section up to
// actual collected reviews (doc/phases/10-reviews-ratings-wishlist.md)
// before this goes live; don't ship invented customer quotes as genuine.
const HIGHLIGHTS = [
  {
    theme: "Fit accuracy",
    quote:
      "Every listing shows exactly which phones or cars it fits, so there's no guessing before you buy a cover or a mount.",
    rating: 5,
  },
  {
    theme: "Build quality",
    quote:
      "Covers are drop-tested, mounts use magnetic-grade hardware, and dash cams are chosen for real daily driving conditions.",
    rating: 5,
  },
  {
    theme: "Fast, tracked delivery",
    quote:
      "Orders ship quickly and every step — packed, shipped, delivered — is visible from the order tracking page.",
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-20">
      <div className="container-app">
        <div className="mb-10 text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-accent-600">
            Why customers choose us
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 md:text-3xl">
            Built around getting the fit right
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.theme}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6"
            >
              <Quote className="h-6 w-6 text-accent-300" fill="currentColor" />
              <p className="mt-4 flex-1 text-sm text-navy-600">
                &ldquo;{h.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-navy-900">
                  {h.theme}
                </p>
                <Rating value={h.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
