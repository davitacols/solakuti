"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import MobileMenu from "@/components/MobileMenu";
import { categories, categoryToSlug } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f4ef]/90 backdrop-blur-xl">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
            <Link href="/" className="group flex items-center gap-3" aria-label="Solakuti home">
              <span className="relative h-12 w-40 overflow-hidden sm:w-48 lg:h-14 lg:w-56">
                <Image
                  src="/solakuti-logo-nav.png"
                  alt="Solakuti"
                  fill
                  priority
                  sizes="(max-width: 640px) 160px, 224px"
                  className="object-contain object-left"
                />
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/category/${categoryToSlug(category)}`}
                  className="rounded-full px-4 py-2 text-sm font-bold text-black/68 transition hover:bg-black hover:text-white"
                >
                  {category}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/60 text-black transition hover:border-black hover:bg-black hover:text-white"
                aria-label="Search"
              >
                <Search className="size-5" />
              </Link>
              <LoadingButton
                type="button"
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-[#111] text-white transition hover:bg-red-600 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </LoadingButton>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
