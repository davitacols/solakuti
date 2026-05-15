"use client";

import { Zap } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";

type BreakingNewsBarProps = {
  articles: Article[];
};

export default function BreakingNewsBar({ articles }: BreakingNewsBarProps) {
  const headlines = articles.filter((article) => article.category === "Breaking News").concat(articles);
  const tickerItems = [...headlines.slice(0, 6), ...headlines.slice(0, 6)];

  return (
    <section className="border-b border-black/10 bg-[#111] text-white" aria-label="Breaking news">
      <div className="container-page flex h-12 items-center overflow-hidden">
        <div className="mr-5 flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
          <Zap className="size-3.5 fill-white" />
          Breaking
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap">
            {tickerItems.map((article, index) => (
              <LoadingLink
                href={`/article/${article.slug}`}
                key={`${article.id}-${index}`}
                className="inline text-sm font-semibold text-white/82 transition hover:text-white"
              >
                {article.title}
              </LoadingLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
