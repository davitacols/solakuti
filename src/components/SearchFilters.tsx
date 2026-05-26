"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Category } from "@/types/article";

type SearchFiltersProps = {
  query: string;
  categories: Category[];
  activeCategory?: string;
  suggestions?: string[];
};

export default function SearchFilters({ query, categories, activeCategory, suggestions = [] }: SearchFiltersProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  function applyCategory(slug: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (slug !== "all") params.set("category", slug);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div>
      {/* Suggestions */}
      {suggestions.length > 0 && !query && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs font-bold text-black/35">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-black/60 transition hover:border-red-600 hover:text-red-600"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Filter toggle */}
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-black transition hover:border-black sm:hidden"
      >
        <Filter className="size-3.5" />
        Filters
      </button>

      {/* Category filter pills */}
      <div className={`flex-wrap gap-1.5 sm:flex ${showFilters ? "flex" : "hidden"}`}>
        <button
          type="button"
          onClick={() => applyCategory("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${!activeCategory ? "bg-[#111] text-white" : "border border-black/10 bg-white text-black/50 hover:border-black"}`}
        >
          All
        </button>
        {categories.slice(0, 8).map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => applyCategory(cat.slug)}
            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${activeCategory === cat.slug ? "bg-[#111] text-white" : "border border-black/10 bg-white text-black/50 hover:border-black"}`}
          >
            {cat.name}
          </button>
        ))}
        {activeCategory && (
          <button
            type="button"
            onClick={() => applyCategory("all")}
            className="inline-flex items-center gap-1 rounded-full bg-red-600/10 px-3 py-1.5 text-xs font-black text-red-600"
          >
            <X className="size-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
