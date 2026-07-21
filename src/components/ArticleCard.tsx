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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_2px_10px_rgba(18,18,18,0.05)] transition-shadow duration-300 hover:shadow-[0_14px_40px_rgba(18,18,18,0.12)]"
    >
      <LoadingLink href={`/article/${article.slug}`} className="block overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-black/5">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        </div>
      </LoadingLink>

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <Link
          href={`/category/${categoryToSlug(article.category)}`}
          className="self-start text-[11px] font-black uppercase tracking-[0.18em] text-red-600 transition hover:text-[#111]"
        >
          {article.category}
        </Link>
        <h3
          className={
            compact
              ? "mt-2 text-lg font-black leading-[1.2] tracking-[-0.03em] text-balance"
              : "mt-2 text-xl font-black leading-[1.2] tracking-[-0.035em] text-balance"
          }
        >
          <LoadingLink href={`/article/${article.slug}`} className="inline transition hover:text-red-600">
            {article.title}
          </LoadingLink>
        </h3>
        {!compact && (
          <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-black/60">{article.excerpt}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-[11px] font-bold text-black/45">
          <span className="text-black/60">{article.author}</span>
          <span className="size-1 rounded-full bg-black/20" />
          <span>{formatDate(article.publishedAt)}</span>
          <span className="size-1 rounded-full bg-black/20" />
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {article.readTime}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
