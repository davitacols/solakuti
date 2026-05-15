"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { categories, categoryToSlug } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <motion.nav
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="ml-auto flex h-full w-[86%] max-w-sm flex-col bg-[#111] p-6 text-white"
        aria-label="Mobile navigation"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="relative h-14 w-48 overflow-hidden" onClick={onClose} aria-label="Solakuti home">
            <Image
              src="/solakuti-logo-nav.png"
              alt="Solakuti"
              fill
              sizes="192px"
              className="object-contain object-left"
            />
          </Link>
          <LoadingButton
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-white/15 transition hover:bg-white hover:text-black"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </LoadingButton>
        </div>

        <div className="mt-8 flex flex-col gap-1">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${categoryToSlug(category)}`}
              onClick={onClose}
              className="rounded-md px-1 py-4 text-2xl font-semibold tracking-tight text-white/86 transition hover:text-red-400"
            >
              {category}
            </Link>
          ))}
        </div>

        <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-400">Daily Brief</p>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Sharp Nigerian headlines, policy signals and culture notes every morning.
          </p>
        </div>
      </motion.nav>
    </motion.div>
  );
}
