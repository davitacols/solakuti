import type { Metadata } from "next";
import { Search, TrendingUp } from "lucide-react";
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

const suggestions = ["Politics", "Economy", "Breaking News", "Entertainment", "Sports", "Security", "Lagos", "Abuja", "Nollywood", "CBN"];

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

  return (
    <main>
      <BreakingNewsBar articles={latestArticles} />

      {/* Hero / search bar */}
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

          {/* Quick suggestions */}
          {!query && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">Try:</span>
              {suggestions.slice(0, 6).map((s) => (
                <a
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-bold text-white/55 transition hover:border-white/40 hover:text-white"
                >
                  {s}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        {/* Result count + filters */}
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

        <SearchFilters query={query} categories={categories} activeCategory={category} suggestions={suggestions} />

        {/* Has results */}
        {query && results.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* No results */}
        {query && results.length === 0 && (
          <div className="mt-6 rounded-xl border border-black/10 bg-white p-8 sm:p-10">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-red-50 text-red-600">
                <Search className="size-6" />
              </div>
              <h3 className="text-xl font-black tracking-[-0.03em] text-[#111]">
                No results for &ldquo;{query}&rdquo;
              </h3>
              <p className="mt-2 text-sm leading-6 text-black/55">
                Try a broader term, check the spelling, or browse a section below.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <a
                    key={s}
                    href={`/search?q=${encodeURIComponent(s)}`}
                    className="rounded-full border border-black/10 bg-[#f7f4ef] px-3.5 py-1.5 text-xs font-bold text-black/60 transition hover:bg-black hover:text-white"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No query — latest + trending */}
        {!query && (
          <div className="mt-6 space-y-10">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-red-600" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/45">Latest stories</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latestArticles.slice(0, 6).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-black/45">Browse by section</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <a
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black/65 transition hover:bg-[#111] hover:text-white"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
