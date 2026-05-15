"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

type FeaturedArticleProps = {
  article: Article;
};

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="group relative min-h-[620px] overflow-hidden rounded-lg bg-black text-white editorial-shadow"
    >
      <Image
        src={article.image}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="object-cover opacity-80 transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.38),rgba(0,0,0,0.08))]" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
            Lead Story
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.06em] sm:text-5xl lg:text-7xl xl:text-8xl">
            {article.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">{article.excerpt}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4 text-sm font-bold text-white/70">
            <span>{article.author}</span>
            <span className="size-1 rounded-full bg-white/40" />
            <span>{formatDate(article.publishedAt)}</span>
            <LoadingLink
              href={`/article/${article.slug}`}
              className="inline-flex overflow-hidden rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-red-600 hover:text-white"
            >
              <span className="inline-flex items-center gap-2">
                Read analysis
                <ArrowUpRight className="size-4" />
              </span>
            </LoadingLink>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
