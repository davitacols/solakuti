"use client";

import { motion, type Variants } from "framer-motion";
import ArticleCard from "@/components/ArticleCard";
import FeaturedArticle from "@/components/FeaturedArticle";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";

type HeroSectionProps = {
  featured: Article;
  secondary: Article[];
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function HeroSection({ featured, secondary }: HeroSectionProps) {
  const sideStories = secondary.slice(0, 2);
  const briefingStories = secondary.slice(2, 6);

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={stagger}
      className="container-page py-7 lg:py-12"
    >
      <motion.div
        variants={fadeUp}
        className="mb-6 grid gap-4 border-b-2 border-black pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end"
      >
        <div>
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-red-600">
            <span className="size-2 rounded-full bg-red-600" />
            Front page
          </p>
          <h2 className="mt-2 max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.055em] text-[#111] sm:text-4xl lg:text-5xl">
            The stories shaping Nigeria right now.
          </h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-black/58 lg:justify-self-end lg:border-l lg:border-black/15 lg:pl-6">
          Live coverage, sharp analysis and public-interest reporting from Solakuti&apos;s newsroom.
        </p>
      </motion.div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.72fr)]">
        <motion.div variants={fadeUp}>
          <FeaturedArticle article={featured} />
        </motion.div>
        <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          {sideStories.map((article) => (
            <motion.div key={article.id} variants={fadeUp}>
              <ArticleCard article={article} compact />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {briefingStories.length > 0 && (
        <motion.aside
          variants={fadeUp}
          className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#111] text-white editorial-shadow"
          aria-label="Latest briefing"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-400">Latest briefing</p>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Newsroom wire</span>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            {briefingStories.map((article, index) => (
              <article
                key={article.id}
                className="group border-t border-white/10 p-5 first:border-t-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l xl:border-l xl:border-t-0 xl:first:border-l-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-400">{article.category}</p>
                  <span className="text-xs font-black text-white/20">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <LoadingLink
                  href={`/article/${article.slug}`}
                  className="mt-2 block text-base font-black leading-snug tracking-[-0.025em] text-white/92 transition group-hover:text-red-300"
                >
                  {article.title}
                </LoadingLink>
              </article>
            ))}
          </div>
        </motion.aside>
      )}
    </motion.section>
  );
}
