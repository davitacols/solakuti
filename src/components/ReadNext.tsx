"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";

type ReadNextProps = {
  articles: Article[];
};

const STORAGE_KEY = "solakuti-category-views";

function getTopCategory(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const views: Record<string, number> = JSON.parse(stored);
    const sorted = Object.entries(views).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
  } catch {
    return null;
  }
}

export function trackCategoryView(category: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const views: Record<string, number> = stored ? JSON.parse(stored) : {};
    views[category] = (views[category] ?? 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {}
}

export default function ReadNext({ articles }: ReadNextProps) {
  const [suggestion, setSuggestion] = useState<Article | null>(null);

  useEffect(() => {
    const topCategory = getTopCategory();
    if (!topCategory) return;
    const match = articles.find((a) => a.category === topCategory);
    if (match) setSuggestion(match);
  }, [articles]);

  if (!suggestion) return null;

  return (
    <section className="container-page py-4">
      <LoadingLink
        href={`/article/${suggestion.slug}`}
        className="flex items-center gap-3 rounded-lg border border-black/8 bg-white px-4 py-3 transition hover:border-red-600/30 hover:shadow-sm sm:gap-4 sm:px-5 sm:py-4"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-600/10 sm:size-9">
          <Sparkles className="size-4 text-red-600" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-600 sm:text-[11px]">Suggested for you</p>
          <p className="mt-0.5 truncate text-sm font-bold text-[#111] sm:text-base">{suggestion.title}</p>
        </div>
        <span className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.1em] text-black/30 sm:block">
          {suggestion.category}
        </span>
      </LoadingLink>
    </section>
  );
}
