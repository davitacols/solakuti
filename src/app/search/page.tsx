import type { Metadata } from "next";
import { Search } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import LoadingButton from "@/components/LoadingButton";
import SearchFilters from "@/components/SearchFilters";
import { getCategories, getLatestArticles, searchArticles } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Search",
  description: "Search Solakuti reporting across politics, economy, security, entertainment, sports, technology and opinion.",
  path: "/search",
  noIndex: true
});

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", category } = await searchParams;
  const query = q.trim();
  const [latestArticles, allResults, categories] = await Promise.all([
    getLatestArticles(),
    searchArticles(query),
    getCategories()
  ]);

  const results = category
    ? allResults.filter((a) => a.category.toLowerCase().replace(/\s+/g, "-") === category)
    : allResults;

  const suggestions = ["Politics", "Economy", "Breaking News", "Entertainment", "Sports", "Security"];

  return (
    <main>
      <BreakingNewsBar articles={latestArticles} />

      <section className="bg-[#111] text-white">
        <div className="container-page py-10 sm:py-14 lg:py-16">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">Solakuti search</p>
          <h1 className="mt-3 text-3xl font-black leading-none tracking-[-0.06em] sm:text-5xl lg:text-7xl">
            Find the signal.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/50">
            Search across politics, markets, security, culture, sports and more.
          </p>
          <form action="/search" className="mt-7 flex max-w-2xl flex-col gap-2 rounded-xl border border-white/12 bg-white p-1.5 shadow-2xl sm:flex-row sm:p-2">
            <label htmlFor="q" className="sr-only">Search Solakuti</label>
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Search className="size-5 shrink-0 text-black/30" />
              <input
                id="q"
                name="q"
                defaultValue={query}
                placeholder="Search stories, topics, authors..."
                className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-black outline-none placeholder:text-black/35 sm:h-12 sm:text-base"
              />
            </div>
            <LoadingButton
              type="submit"
              className="h-11 rounded-lg bg-red-600 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#111] sm:h-12 sm:px-6 sm:text-sm"
            >
              Search
            </LoadingButton>
          </form>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        <div className="mb-6 border-b border-black/8 pb-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-600">
                {query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Explore"}
              </p>
              <h2 className="mt-1.5 text-2xl font-black tracking-[-0.04em] text-[#111] sm:text-3xl">
                {query ? `Results for "${query}"` : "Search the newsroom"}
              </h2>
            </div>
          </div>
        </div>

        <SearchFilters
          query={query}
          categories={categories}
          activeCategory={category}
          suggestions={suggestions}
        />

        {query && results.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-black/12 bg-[#faf8f4] p-8 text-center">
            <p className="text-lg font-bold text-black/55">
              No results found. Try a broader term like Lagos, policy, markets or Nollywood.
            </p>
          </div>
        )}

        {!query && (
          <div className="mt-6">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-black/35">Latest stories</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latestArticles.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
