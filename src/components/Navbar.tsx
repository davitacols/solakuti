"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Menu, Radio, Search, TrendingUp, X } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import LoadingLink from "@/components/LoadingLink";
import MobileMenu from "@/components/MobileMenu";
import DarkModeToggle from "@/components/DarkModeToggle";
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
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  const categoryItems = navCategories?.length
    ? navCategories.map((c) => ({ name: c.name, slug: c.slug }))
    : categories.map((c) => ({ name: c, slug: categoryToSlug(c) }));
  const primaryCategories = categoryItems.slice(0, 7);
  const overflowCategories = categoryItems.slice(7);
  const utilityLinks = [
    { label: "Live scores", href: "/livescores" },
    { label: "About", href: "/about" },
    { label: "RSS", href: "/rss.xml" }
  ];

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 48);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/" shortcut to open search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  function navPillClass(href: string) {
    return pathname === href
      ? "inline-flex h-9 items-center rounded-full bg-[#111] px-4 text-sm font-black text-white"
      : "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-black text-black/55 transition hover:bg-[#111] hover:text-white";
  }

  function categoryPillClass(slug: string) {
    return pathname === `/category/${slug}`
      ? "inline-flex h-9 items-center rounded-full bg-[#111] px-3.5 text-sm font-black text-white"
      : "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-black text-black/55 transition hover:bg-[#111] hover:text-white";
  }

  function mobilePillClass(href: string) {
    return pathname === href
      ? "shrink-0 rounded-full bg-[#111] px-3 py-1.5 text-xs font-black text-white"
      : "shrink-0 rounded-full border border-black/10 bg-[#f7f4ef] px-3 py-1.5 text-xs font-black text-black/60 transition hover:bg-[#111] hover:text-white";
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-2xl transition-shadow duration-300 ${
          scrolled ? "shadow-[0_4px_32px_rgba(0,0,0,0.1)]" : "shadow-[0_1px_0_rgba(0,0,0,0.05)]"
        }`}
      >
        {/* Accent line */}
        <div className="h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-orange-400" />

        {/* Top utility bar — slides away on scroll */}
        <div
          className={`overflow-hidden border-b border-white/10 bg-[#111] text-white transition-all duration-300 ease-out ${
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          }`}
        >
          <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px] font-bold tracking-[0.08em] lg:h-10 lg:text-xs">
            <div className="flex min-w-0 items-center gap-3 text-white/70">
              <span className="inline-flex shrink-0 items-center gap-1.5 font-black uppercase tracking-[0.14em] text-red-400">
                <Radio className="size-3 animate-pulse" />
                Live
              </span>
              <span className="hidden h-3 w-px bg-white/16 sm:block" />
              <CurrentDate />
            </div>
            <div className="hidden shrink-0 items-center gap-5 text-white/50 lg:flex">
              {utilityLinks.map((item) => (
                <LoadingLink key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </LoadingLink>
              ))}
            </div>
          </div>
        </div>

        {/* Main header row */}
        <div className="container-page">
          <div
            className={`flex items-center justify-between gap-3 transition-all duration-300 ${
              scrolled ? "h-14 lg:h-16" : "h-18 lg:h-20"
            }`}
          >
            {/* Left: hamburger + logo */}
            <div className="flex min-w-0 items-center gap-3 lg:gap-5">
              <LoadingButton
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-black/[0.03] text-black transition hover:border-black hover:bg-black hover:text-white xl:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </LoadingButton>

              <LoadingLink href="/" className="group flex min-w-0 items-center overflow-hidden rounded-sm" aria-label="Solakuti home">
                <span
                  className={`relative shrink-0 overflow-hidden transition-all duration-300 ${
                    scrolled
                      ? "h-10 w-36 sm:w-44 lg:h-12 lg:w-52"
                      : "h-13 w-40 sm:w-52 lg:h-16 lg:w-64"
                  }`}
                >
                  <Image
                    src="/solakuti-logo-nav.png"
                    alt="Solakuti"
                    fill
                    priority
                    sizes="(max-width: 640px) 160px, (max-width: 1024px) 208px, 256px"
                    className="object-contain object-left"
                  />
                </span>
              </LoadingLink>
            </div>

            {/* Centre: desktop search */}
            <div className="hidden flex-1 justify-center px-8 lg:flex">
              <form
                onSubmit={handleSearchSubmit}
                className={`relative flex items-center transition-all duration-300 ${searchOpen ? "w-full max-w-lg" : "w-auto"}`}
              >
                {searchOpen ? (
                  <div className="flex w-full items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/5">
                    <Search className="size-4 shrink-0 text-black/35" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search stories, topics, people..."
                      className="w-full bg-transparent text-sm font-semibold text-[#111] outline-none placeholder:font-normal placeholder:text-black/35"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="shrink-0 rounded-full p-1 text-black/35 transition hover:bg-black/8 hover:text-black"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs font-medium text-black/40 transition hover:border-black/20 hover:text-black/65"
                  >
                    <Search className="size-3.5" />
                    Search stories...
                    <kbd className="hidden rounded border border-black/10 bg-black/5 px-1.5 py-0.5 font-mono text-[10px] leading-none text-black/30 lg:block">
                      /
                    </kbd>
                  </button>
                )}
              </form>
            </div>

            {/* Right: dark mode + live scores + mobile search */}
            <div className="flex shrink-0 items-center gap-2">
              <DarkModeToggle />
              <LoadingLink
                href="/livescores"
                className="hidden h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-black text-white shadow-[0_4px_16px_rgba(220,38,38,0.25)] transition hover:bg-[#111] hover:shadow-none lg:inline-flex"
              >
                <Radio className="size-3.5" />
                Live scores
              </LoadingLink>
              <LoadingLink
                href="/search"
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-black/[0.03] text-black transition hover:border-black hover:bg-black hover:text-white lg:hidden"
                aria-label="Search"
              >
                <Search className="size-5" />
              </LoadingLink>
            </div>
          </div>

          {/* Desktop nav bar */}
          <div className="hidden h-11 items-center justify-between gap-4 border-t border-black/8 xl:flex">
            <nav className="flex min-w-0 items-center gap-0.5" aria-label="Main navigation">
              <LoadingLink href="/" className={navPillClass("/")}>
                Top stories
              </LoadingLink>
              {primaryCategories.map((cat) => (
                <LoadingLink key={cat.slug} href={`/category/${cat.slug}`} className={categoryPillClass(cat.slug)}>
                  {cat.name}
                </LoadingLink>
              ))}
              {overflowCategories.length > 0 && (
                <div className="group relative">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-sm font-black text-black/55 transition hover:bg-[#111] hover:text-white"
                  >
                    More
                    <ChevronDown className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 mt-1.5 w-52 translate-y-2 rounded-xl border border-black/10 bg-white p-1.5 opacity-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {overflowCategories.map((cat) => (
                      <LoadingLink
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                          pathname === `/category/${cat.slug}`
                            ? "bg-[#111] text-white"
                            : "text-black/62 hover:bg-[#111] hover:text-white"
                        }`}
                      >
                        {cat.name}
                      </LoadingLink>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              {trendingTopics.length > 0 ? (
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
              ) : (
                <LoadingLink
                  href="/category/breaking-news"
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-black/55 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <TrendingUp className="size-3.5" />
                  Developing
                </LoadingLink>
              )}
            </div>
          </div>
        </div>

        {/* Mobile category scroll */}
        <div className="border-t border-black/8 bg-white/70 xl:hidden">
          <div className="container-page flex h-11 items-center gap-2 overflow-x-auto scrollbar-hide">
            <LoadingLink href="/" className={mobilePillClass("/")}>
              Top stories
            </LoadingLink>
            {primaryCategories.slice(0, 6).map((cat) => (
              <LoadingLink key={cat.slug} href={`/category/${cat.slug}`} className={mobilePillClass(`/category/${cat.slug}`)}>
                {cat.name}
              </LoadingLink>
            ))}
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} navCategories={categoryItems} />
    </>
  );
}
