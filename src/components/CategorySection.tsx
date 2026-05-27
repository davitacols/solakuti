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
      className="py-10"
    >
      <motion.div variants={item} className="mb-6 flex items-end justify-between gap-5 border-t-2 border-black pt-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">{kicker}</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111] sm:text-4xl">
            {title}
          </h2>
        </div>
        <Link
          href={`/category/${slug ?? categoryToSlug(title)}`}
          className="hidden items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-black transition hover:border-black hover:bg-black hover:text-white sm:inline-flex"
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
