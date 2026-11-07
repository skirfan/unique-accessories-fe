"use client";

import { useEffect } from "react";
import "./globals.css";

// Last-resort boundary: fires only if the root layout itself throws, so it
// has to render its own <html>/<body> — next/font, Header and Footer from
// layout.tsx aren't available here since that's what crashed.
export default function GlobalError({
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
    <html lang="en">
      <body className="bg-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-sm text-sm text-navy-500">
            The application hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-accent-500 px-6 py-2.5 font-display text-sm font-semibold text-white hover:bg-accent-600"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
