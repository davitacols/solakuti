import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import { getLatestArticles } from "@/lib/api";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false }
};

export default async function NotFound() {
  let articles: Awaited<ReturnType<typeof getLatestArticles>> = [];
  try {
    articles = await getLatestArticles();
  } catch {
    articles = [];
  }

  return (
    <main className="min-h-[70vh]">
      <section className="bg-[#111] text-white">
        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-[0.14em]">404</span>
            <span className="text-xs font-bold text-white/40">Page not found</span>
          </div>
          <h1 className="mt-6 max-w-3xl text-3xl font-black leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            This page is not in the archive.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/50 sm:text-base">
            The story may have moved, the address may be incorrect, or the article may not be public yet.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black text-white transition hover:bg-white hover:text-black"
            >
              <Home className="size-4" />
              Home
            </Link>
            <Link
              href="/search"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black text-white/70 transition hover:border-white hover:text-white"
            >
              <Search className="size-4" />
              Search
            </Link>
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.history.back()}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black text-white/70 transition hover:border-white hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Go back
            </button>
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="container-page py-8 sm:py-10">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">While you&apos;re here</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#111] sm:text-3xl">Latest stories</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
