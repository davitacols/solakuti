"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";
import { categoryToSlug, formatDate } from "@/lib/utils";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
};

export default function ArticleCard({ article, compact = false }: ArticleCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-md border border-black/10 bg-white shadow-[0_18px_50px_rgba(18,18,18,0.08)] transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(215,25,32,0.1)]"
    >
      {/* Hover glow border */}
      <div className="pointer-events-none absolute inset-0 rounded-md border-2 border-red-600/0 transition-colors duration-300 group-hover:border-red-600/30" />

      <LoadingLink href={`/article/${article.slug}`} className="block overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-black">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-70" />
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-red-600">
            {article.category}
          </span>
        </div>
      </LoadingLink>

      <div className={compact ? "p-4" : "p-5"}>
        <Link
          href={`/category/${categoryToSlug(article.category)}`}
          className="text-xs font-black uppercase tracking-[0.18em] text-black/48 transition hover:text-red-600"
        >
          {article.category}
        </Link>
        <h3
          className={
            compact
              ? "mt-2 text-lg font-black leading-tight tracking-[-0.03em]"
              : "mt-2 text-xl font-black leading-tight tracking-[-0.035em]"
          }
        >
          <LoadingLink href={`/article/${article.slug}`} className="inline transition hover:text-red-600">
            {article.title}
          </LoadingLink>
        </h3>
        {!compact && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/62">{article.excerpt}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-black/48">
          <span>{article.author}</span>
          <span className="size-1 rounded-full bg-black/20" />
          <span>{formatDate(article.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {article.readTime}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
