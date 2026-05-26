"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Menu, Radio, Search, Sparkles, TrendingUp } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import LoadingLink from "@/components/LoadingLink";
import MobileMenu from "@/components/MobileMenu";
import { categories, categoryToSlug } from "@/lib/utils";
import { Category } from "@/types/article";

type NavbarProps = {
  navCategories?: Category[];
};

export default function Navbar({ navCategories }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const categoryItems = navCategories?.length
    ? navCategories.map((category) => ({ name: category.name, slug: category.slug }))
    : categories.map((category) => ({ name: category, slug: categoryToSlug(category) }));
  const primaryCategories = categoryItems.slice(0, 7);
  const overflowCategories = categoryItems.slice(7);
  const utilityLinks = [
    { label: "Live scores", href: "/livescores" },
    { label: "About", href: "/about" },
    { label: "RSS", href: "/rss.xml" },
    { label: "Search", href: "/search" }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f4ef]/95 shadow-[0_14px_45px_rgba(18,18,18,0.08)] backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-[#111] text-white">
          <div className="container-page flex h-9 items-center justify-between gap-4 overflow-hidden text-[11px] font-black uppercase tracking-[0.14em] lg:h-10 lg:text-xs lg:tracking-[0.16em]">
            <div className="flex min-w-0 items-center gap-3 text-white/70">
              <span className="inline-flex shrink-0 items-center gap-2 text-red-300">
                <Radio className="size-3.5" />
                Live newsroom
              </span>
              <span className="hidden h-3 w-px bg-white/16 sm:block" />
              <span className="truncate">Premium Nigerian reporting for the next news cycle</span>
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

        <div className="container-page">
          <div className="flex h-18 items-center justify-between gap-3 lg:h-24">
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
                <span className="relative h-13 w-42 shrink-0 overflow-hidden sm:w-56 lg:h-17 lg:w-72">
                  <Image
                    src="/solakuti-logo-nav.png"
                    alt="Solakuti"
                    fill
                    priority
                    sizes="(max-width: 640px) 168px, (max-width: 1024px) 224px, 288px"
                    className="object-contain object-left transition duration-300 group-hover:scale-[1.02]"
                  />
                </span>
              </LoadingLink>
            </div>

            <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex">
              <div className="flex max-w-xl items-center gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-black/45 shadow-[0_10px_30px_rgba(18,18,18,0.06)]">
                <Sparkles className="size-4 text-red-600" />
                <span className="truncate">Politics, culture, economy, security and live sport</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <LoadingLink
                href="/livescores"
                className="hidden h-11 items-center gap-2 rounded-full border border-red-600/20 bg-red-600 px-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(220,38,38,0.22)] transition hover:bg-[#111] lg:inline-flex"
              >
                <Radio className="size-4" />
                Live scores
              </LoadingLink>
              <LoadingLink
                href="/search"
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/80 text-black transition hover:border-black hover:bg-black hover:text-white lg:size-11"
                aria-label="Search"
              >
                <Search className="size-5" />
              </LoadingLink>
            </div>
          </div>

          <div className="hidden h-12 items-center justify-between gap-4 border-t border-black/10 xl:flex">
            <nav className="flex min-w-0 items-center gap-1 overflow-visible" aria-label="Main navigation">
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
                  className="inline-flex h-9 items-center rounded-full px-3.5 text-sm font-black text-black/64 transition hover:bg-black hover:text-white"
                >
                  {category.name}
                </LoadingLink>
              ))}
              {overflowCategories.length > 0 && (
                <div className="group relative">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-sm font-black text-black/64 transition hover:bg-black hover:text-white"
                  >
                    More
                    <ChevronDown className="size-4 transition group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 w-60 translate-y-3 rounded-lg border border-black/10 bg-white p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                    {overflowCategories.map((category) => (
                      <LoadingLink
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="block rounded-md px-3 py-2 text-sm font-black text-black/62 transition hover:bg-black hover:text-white"
                      >
                        {category.name}
                      </LoadingLink>
                    ))}
                  </div>
                </div>
              )}
            </nav>
            <LoadingLink
              href="/category/breaking-news"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-black/56 transition hover:border-red-600 hover:text-red-600"
            >
              <TrendingUp className="size-4" />
              Developing
            </LoadingLink>
          </div>
        </div>

        <div className="border-t border-black/10 bg-white/72 xl:hidden">
          <div className="container-page flex h-11 items-center gap-2 overflow-x-auto">
            <LoadingLink href="/" className="shrink-0 rounded-full bg-[#111] px-3 py-2 text-xs font-black text-white">
              Top stories
            </LoadingLink>
            {primaryCategories.slice(0, 6).map((category) => (
              <LoadingLink
                key={category.slug}
                href={`/category/${category.slug}`}
                className="shrink-0 rounded-full border border-black/10 bg-[#f7f4ef] px-3 py-2 text-xs font-black text-black/62"
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
