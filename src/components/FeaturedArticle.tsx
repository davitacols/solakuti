"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

type FeaturedArticleProps = {
  article: Article;
};

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const spotlightX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const spotlightY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      onMouseMove={handleMouseMove}
      aria-labelledby={`lead-story-${article.id}`}
      className="group relative min-h-[520px] overflow-hidden rounded-xl bg-black text-white editorial-shadow sm:min-h-[600px] xl:min-h-[680px]"
    >
      <Image
        src={article.image}
        alt={article.title}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_20%,rgba(0,0,0,0.92)_100%)]" />

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useTransform(
            [spotlightX, spotlightY],
            ([x, y]) => `radial-gradient(600px circle at ${x} ${y}, rgba(215,25,32,0.12), transparent 60%)`
          ),
        }}
      />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] sm:text-xs">
              Lead story
            </span>
            <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-sm sm:text-xs">
              {article.category}
            </span>
          </div>
          <h1
            id={`lead-story-${article.id}`}
            className="mt-4 max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl"
          >
            {article.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/76 sm:text-base sm:leading-7">
            {article.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold text-white/66 sm:mt-6 sm:text-sm">
            <span>{article.author}</span>
            <span className="size-1 rounded-full bg-white/40" />
            <span>{formatDate(article.publishedAt)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {article.readTime}
            </span>
            <LoadingLink
              href={`/article/${article.slug}`}
              className="inline-flex min-h-11 items-center overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-red-600 hover:text-white sm:ml-1"
            >
              <span className="inline-flex items-center gap-2">
                Read full story
                <ArrowRight className="size-4" />
              </span>
            </LoadingLink>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
