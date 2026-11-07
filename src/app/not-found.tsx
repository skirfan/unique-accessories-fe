import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-app flex flex-col items-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-400">
        <Compass className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-navy-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonVariants({ variant: "primary" })}>
          Back to Home
        </Link>
        <Link
          href="/products"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
