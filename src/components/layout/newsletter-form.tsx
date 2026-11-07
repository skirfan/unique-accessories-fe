"use client";

import { useId, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const inputId = useId();

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.message(
      "Newsletter signup is not available yet. Please check back later.",
    );
    setEmail("");
  }

  return (
    <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2">
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Get 10% off — enter your email"
        className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-navy-400 focus-visible:ring-2 focus-visible:ring-accent-500 focus:border-accent-400"
      />
      <button
        type="submit"
        className={buttonVariants({
          variant: "primary",
          size: "sm",
          className: "shrink-0",
        })}
      >
        Subscribe
      </button>
    </form>
  );
}
