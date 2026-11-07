"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-5 max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for covers, chargers, mounts…"
        aria-label="Search products"
        className="w-full rounded-full border border-navy-100 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus-visible:ring-2 focus-visible:ring-accent-500 focus:border-accent-400"
      />
    </form>
  );
}
