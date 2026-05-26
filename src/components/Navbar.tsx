"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, Menu, Radio, Search, TrendingUp, X } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import LoadingLink from "@/components/LoadingLink";
import MobileMenu from "@/components/MobileMenu";
import { categories, categoryToSlug } from "@/lib/utils";
import { Category } from "@/types/article";

type NavbarProps = {
  navCategories?: Category[];
  trendingTopics?: string[];
};

function CurrentDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(
      new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }).format(new Date())
    );
  }, []);

  if (!date) return null;
  return <span className="truncate">{date}</span>;
}

export default function Navbar({ navCategories, trendingTopics = [] }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryItems = navCategories?.length
    ? navCategories.map((category) => ({ name: category.name, slug: category.slug }))
    : categories.map((category) => ({ name: category, slug: categoryToSlug(category) }));
  const primaryCategories = categoryItems.slice(0, 7);
  const overflowCategories = categoryItems.slice(7);
  const utilityLinks = [
    { label: "Live scores", href: "/livescores" },
    { label: "About", href: "/about" },
    { label: "RSS", href: "/rss.xml" }
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f4ef]/95 shadow-[0_14px_45px_rgba(18,18,18,0.08)] backdrop-blur-2xl">
        {/* Accent gradient line */}
        <div className="h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />

        {/* Top utility bar */}
        <div className="border-b border-white/10 bg-[#111] text-white">
          <div className="container-page flex h-9 items-center justify-between gap-4 overflow-hidden text-[11px] font-bold tracking-[0.08em] lg:h-10 lg:text-xs">
            <div className="flex min-w-0 items-center gap-3 text-white/70">
              <span className="inline-flex shrink-0 items-center gap-1.5 font-black uppercase tracking-[0.14em] text-red-400">
                <Radio className="size-3 animate-pulse" />
                Live
              </span>
              <span className="hidden h-3 w-px bg-white/16 sm:block" />
              <CurrentDate />
            </div>
            <div className="hidden shrink-0 items-center gap-4 text-white/62 lg:flex">
              {utilityLinks.map((item) => (
                <LoadingLink key={item.href} href={item.href} className="rounded px-1 transition hover:text-white">
                  {item.label}
                </LoadingLink>
              ))}
            </div>
          </div>
        </div>

        {/* Main header row */}
        <div className="container-page">
          <div className="flex h-18 items-center justify-between gap-3 lg:h-20">
            <div className="flex min-w-0 items-center gap-3 lg:gap-5">
              <LoadingButton
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/70 text-black transition hover:border-black hover:bg-black hover:text-white xl:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </LoadingButton>

              <LoadingLink href="/" className="group flex min-w-0 items-center gap-3 overflow-hidden rounded-md" aria-label="Solakuti home">
                <span className="relative h-13 w-42 shrink-0 overflow-hidden sm:w-56 lg:h-16 lg:w-64">
                  <Image
                    src="/solakuti-logo-nav.png"
                    alt="Solakuti"
                    fill
                    priority
                    sizes="(max-width: 640px) 168px, (max-width: 1024px) 224px, 256px"
                    className="object-contain object-left transition duration-300 group-hover:scale-[1.02]"
                  />
                </span>
              </LoadingLink>
            </div>

            {/* Desktop inline search */}
            <div className="hidden flex-1 justify-center px-6 lg:flex">
              <form
                onSubmit={handleSearchSubmit}
                className={`relative flex items-center transition-all duration-300 ${searchOpen ? "w-full max-w-md" : "w-auto"}`}
              >
                {searchOpen ? (
                  <div className="flex w-full items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 shadow-sm">
                    <Search className="size-4 shrink-0 text-black/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search stories, topics, authors..."
                      className="w-full bg-transparent text-sm font-semibold text-[#111] outline-none placeholder:text-black/35"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="shrink-0 rounded-full p-1 text-black/40 transition hover:bg-black/8 hover:text-black"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-bold text-black/45 shadow-[0_6px_20px_rgba(18,18,18,0.04)] transition hover:border-black/20 hover:text-black/60"
                  >
                    <Search className="size-3.5" />
                    Search Solakuti...
                  </button>
                )}
              </form>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <LoadingLink
                href="/livescores"
                className="hidden h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-black text-white shadow-[0_8px_24px_rgba(220,38,38,0.2)] transition hover:bg-[#111] hover:shadow-[0_8px_24px_rgba(18,18,18,0.2)] lg:inline-flex"
              >
                <Radio className="size-4" />
                Live scores
              </LoadingLink>
              <LoadingLink
                href="/search"
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/80 text-black transition hover:border-black hover:bg-black hover:text-white lg:hidden"
                aria-label="Search"
              >
                <Search className="size-5" />
              </LoadingLink>
            </div>
          </div>

          {/* Desktop navigation bar */}
          <div className="hidden h-12 items-center justify-between gap-4 border-t border-black/8 xl:flex">
            <nav className="flex min-w-0 items-center gap-0.5 overflow-visible" aria-label="Main navigation">
              <LoadingLink
                href="/"
                className="inline-flex h-9 items-center rounded-full bg-[#111] px-4 text-sm font-black text-white transition hover:bg-red-600"
              >
                Top stories
              </LoadingLink>
              {primaryCategories.map((category) => (
                <LoadingLink
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="inline-flex h-9 items-center rounded-full px-3.5 text-sm font-black text-black/60 transition hover:bg-black hover:text-white"
                >
                  {category.name}
                </LoadingLink>
              ))}
              {overflowCategories.length > 0 && (
                <div className="group relative">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-sm font-black text-black/60 transition hover:bg-black hover:text-white"
                  >
                    More
                    <ChevronDown className="size-4 transition group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 w-56 translate-y-3 rounded-lg border border-black/10 bg-white p-1.5 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                    {overflowCategories.map((category) => (
                      <LoadingLink
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="block rounded-md px-3 py-2 text-sm font-bold text-black/62 transition hover:bg-black hover:text-white"
                      >
                        {category.name}
                      </LoadingLink>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* Trending topics or developing link */}
            <div className="flex shrink-0 items-center gap-2">
              {trendingTopics.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-red-600" />
                  {trendingTopics.slice(0, 3).map((topic) => (
                    <LoadingLink
                      key={topic}
                      href={`/search?q=${encodeURIComponent(topic)}`}
                      className="rounded-full bg-red-600/8 px-2.5 py-1 text-[11px] font-black text-red-700 transition hover:bg-red-600 hover:text-white"
                    >
                      {topic}
                    </LoadingLink>
                  ))}
                </div>
              )}
              {trendingTopics.length === 0 && (
                <LoadingLink
                  href="/category/breaking-news"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-black/56 transition hover:border-red-600 hover:text-red-600"
                >
                  <TrendingUp className="size-3.5" />
                  Developing
                </LoadingLink>
              )}
            </div>
          </div>
        </div>

        {/* Mobile category scroll */}
        <div className="border-t border-black/8 bg-white/60 xl:hidden">
          <div className="container-page flex h-11 items-center gap-2 overflow-x-auto scrollbar-hide">
            <LoadingLink href="/" className="shrink-0 rounded-full bg-[#111] px-3 py-1.5 text-xs font-black text-white">
              Top stories
            </LoadingLink>
            {primaryCategories.slice(0, 6).map((category) => (
              <LoadingLink
                key={category.slug}
                href={`/category/${category.slug}`}
                className="shrink-0 rounded-full border border-black/10 bg-[#f7f4ef] px-3 py-1.5 text-xs font-black text-black/60 transition hover:border-black hover:bg-black hover:text-white"
              >
                {category.name}
              </LoadingLink>
            ))}
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} navCategories={categoryItems} />
    </>
  );
}
