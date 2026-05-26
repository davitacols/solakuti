"use client";

import Link from "next/link";
import { Category } from "@/types/article";

type CategoryPillsProps = {
  categories: Category[];
};

export default function CategoryPills({ categories }: CategoryPillsProps) {
  if (!categories.length) return null;

  return (
    <nav className="container-page py-4" aria-label="Category navigation">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111] transition hover:border-black hover:bg-black hover:text-white"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
