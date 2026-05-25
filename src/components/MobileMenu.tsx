"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Radio, Search, X } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import LoadingLink from "@/components/LoadingLink";
import { categories, categoryToSlug } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  navCategories?: Array<{ name: string; slug: string }>;
};

export default function MobileMenu({ open, onClose, navCategories }: MobileMenuProps) {
  const categoryItems = navCategories?.length
    ? navCategories
    : categories.map((category) => ({ name: category, slug: categoryToSlug(category) }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm xl:hidden"
          onClick={onClose}
        >
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="ml-auto flex h-full w-[88%] max-w-md flex-col overflow-y-auto bg-[#111] text-white shadow-2xl"
            aria-label="Mobile navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <LoadingLink href="/" className="relative h-16 w-56 overflow-hidden rounded-md" onClick={onClose} aria-label="Solakuti home">
                  <Image
                    src="/solakuti-logo-nav.png"
                    alt="Solakuti"
                    fill
                    sizes="224px"
                    className="object-contain object-left"
                  />
                </LoadingLink>
                <LoadingButton
                  type="button"
                  onClick={onClose}
                  className="grid size-10 place-items-center rounded-full border border-white/15 transition hover:bg-white hover:text-black"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </LoadingButton>
              </div>

              <div className="mt-5">
                <LoadingLink
                  href="/search"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white text-sm font-black text-black"
                >
                  <Search className="size-4" />
                  Search
                </LoadingLink>
                <LoadingLink
                  href="/livescores"
                  onClick={onClose}
                  className="ml-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-sm font-black text-white"
                >
                  <Radio className="size-4" />
                  Live scores
                </LoadingLink>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-600/12 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-300">
                <Radio className="size-3.5" />
                Sections
              </div>
              <div className="grid gap-2">
                {categoryItems.map((category) => (
                  <LoadingLink
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] px-4 py-4 text-lg font-black text-white/88 transition hover:border-red-400/50 hover:bg-red-600 hover:text-white"
                  >
                    {category.name}
                    <ArrowUpRight className="size-4 text-white/35 transition group-hover:text-white" />
                  </LoadingLink>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-white/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Daily Brief</p>
              <p className="mt-2 text-sm leading-6 text-white/66">
                Sharp Nigerian headlines, public-interest reporting and culture notes from Solakuti.
              </p>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
