import type { Metadata } from "next";
import { Search } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import LoadingButton from "@/components/LoadingButton";
import { getLatestArticles, searchArticles } from "@/lib/api";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "Search",
  description: "Search Solakuti reporting across politics, economy, security, entertainment and opinion."
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const [latestArticles, results] = await Promise.all([
    getLatestArticles(),
    searchArticles(query)
  ]);

  return (
    <main>
      <BreakingNewsBar articles={latestArticles} />
      <section className="bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Solakuti search</p>
          <h1 className="mt-3 text-5xl font-black leading-none tracking-[-0.07em] sm:text-7xl">
            Find the signal.
          </h1>
          <form action="/search" className="mt-8 flex max-w-3xl flex-col gap-3 rounded-lg border border-white/12 bg-white p-2 shadow-2xl sm:flex-row">
            <label htmlFor="q" className="sr-only">
              Search Solakuti
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Search className="size-5 shrink-0 text-black/35" />
              <input
                id="q"
                name="q"
                defaultValue={query}
                placeholder="Search politics, markets, security, culture..."
                className="h-12 min-w-0 flex-1 bg-transparent text-base font-bold text-black outline-none placeholder:text-black/35"
              />
            </div>
            <LoadingButton
              type="submit"
              className="h-12 rounded-md bg-red-600 px-6 text-sm font-black uppercase tracking-[0.14em] transition hover:bg-[#111]"
            >
              Search
            </LoadingButton>
          </form>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 border-b border-black/12 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
              {query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Start typing"}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111] sm:text-4xl">
              {query ? `Search results for "${query}"` : "Search the newsroom"}
            </h2>
          </div>
        </div>

        {query && results.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="rounded-lg border border-dashed border-black/16 bg-white/65 p-8">
            <p className="text-lg font-bold text-black/58">
              No results yet. Try a broader term like Lagos, policy, markets, security or Nollywood.
            </p>
          </div>
        )}

        {!query && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestArticles.slice(0, 6).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
