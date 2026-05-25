"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Menu, Radio, Search } from "lucide-react";
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
  const primaryCategories = categoryItems.slice(0, 5);
  const overflowCategories = categoryItems.slice(5);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f4ef]/92 backdrop-blur-2xl">
        <div className="hidden border-b border-black/10 bg-[#111] text-white lg:block">
          <div className="container-page flex h-9 items-center justify-between text-xs font-black uppercase tracking-[0.16em]">
            <div className="flex items-center gap-3 text-white/70">
              <span className="inline-flex items-center gap-2 text-red-300">
                <Radio className="size-3.5" />
                Live newsroom
              </span>
              <span className="h-3 w-px bg-white/16" />
              <span>Premium Nigerian reporting</span>
            </div>
            <div className="flex items-center gap-4 text-white/62">
              <LoadingLink href="/livescores" className="rounded px-1 transition hover:text-white">Live scores</LoadingLink>
              <LoadingLink href="/about" className="rounded px-1 transition hover:text-white">About</LoadingLink>
              <LoadingLink href="/rss.xml" className="rounded px-1 transition hover:text-white">RSS</LoadingLink>
              <LoadingLink href="/news-sitemap.xml" className="rounded px-1 transition hover:text-white">News sitemap</LoadingLink>
              <LoadingLink href="/search" className="rounded px-1 transition hover:text-white">Archive search</LoadingLink>
            </div>
          </div>
        </div>

        <div className="container-page">
          <div className="flex h-17 items-center justify-between gap-4 lg:h-20">
            <LoadingLink href="/" className="group flex min-w-0 items-center gap-3 overflow-hidden rounded-md" aria-label="Solakuti home">
              <span className="relative h-13 w-44 shrink-0 overflow-hidden sm:w-56 lg:h-16 lg:w-64">
                <Image
                  src="/solakuti-logo-nav.png"
                  alt="Solakuti"
                  fill
                  priority
                  sizes="(max-width: 640px) 176px, 256px"
                  className="object-contain object-left transition duration-300 group-hover:scale-[1.02]"
                />
              </span>
            </LoadingLink>

            <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
              {primaryCategories.map((category) => (
                <LoadingLink
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full px-3.5 py-2 text-sm font-black text-black/68 transition hover:bg-black hover:text-white"
                >
                  {category.name}
                </LoadingLink>
              ))}
              {overflowCategories.length > 0 && (
                <div className="group relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-black text-black/68 transition hover:bg-black hover:text-white"
                  >
                    More
                    <ChevronDown className="size-4 transition group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute right-0 top-full w-56 translate-y-3 rounded-lg border border-black/10 bg-white p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
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

            <div className="flex items-center gap-2">
              <LoadingLink
                href="/search"
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/70 text-black transition hover:border-black hover:bg-black hover:text-white"
                aria-label="Search"
              >
                <Search className="size-5" />
              </LoadingLink>
              <LoadingButton
                type="button"
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-[#111] text-white transition hover:bg-red-600 xl:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </LoadingButton>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} navCategories={categoryItems} />
    </>
  );
}
