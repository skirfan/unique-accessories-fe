"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-app flex flex-col items-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400">
        <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-navy-500">
        We hit a snag loading this page. Try again, or head back to the
        homepage.
      </p>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 max-w-lg rounded-lg bg-navy-50 px-4 py-3 text-left text-xs text-navy-500">
          {error.message}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className={buttonVariants({ variant: "primary" })}
        >
          Try Again
        </button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
