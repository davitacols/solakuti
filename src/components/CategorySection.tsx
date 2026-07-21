"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import { Article, ArticleCategory } from "@/types/article";
import { categoryToSlug } from "@/lib/utils";

type CategorySectionProps = {
  title: ArticleCategory;
  slug?: string;
  kicker: string;
  articles: Article[];
};

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function CategorySection({ title, slug, kicker, articles }: CategorySectionProps) {
  if (!articles.length) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={container}
      className="py-8"
    >
      {/* Category shelves sit a level below the major sections: lighter rule,
          smaller heading, kicker inline rather than stacked. */}
      <motion.div variants={item} className="mb-5 flex items-center justify-between gap-5 border-t border-black/15 pt-5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-2xl font-black tracking-[-0.045em] text-[#111] sm:text-3xl">
            {title}
          </h2>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-600">{kicker}</p>
        </div>
        <Link
          href={`/category/${slug ?? categoryToSlug(title)}`}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-black text-black/50 transition hover:text-red-600 sm:inline-flex"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </motion.div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {articles.slice(0, 4).map((article) => (
          <motion.div key={article.id} variants={item}>
            <ArticleCard article={article} compact />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
