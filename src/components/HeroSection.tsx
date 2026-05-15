import ArticleCard from "@/components/ArticleCard";
import FeaturedArticle from "@/components/FeaturedArticle";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";

type HeroSectionProps = {
  featured: Article;
  secondary: Article[];
};

export default function HeroSection({ featured, secondary }: HeroSectionProps) {
  const sideStories = secondary.slice(0, 3);
  const briefingStories = secondary.slice(3, 8);

  return (
    <section className="container-page py-7 lg:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b-2 border-black pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">
            Front page
          </p>
          <h2 className="mt-2 max-w-5xl text-4xl font-black leading-none tracking-[-0.06em] text-[#111] sm:text-5xl lg:text-6xl">
            The stories shaping Nigeria right now.
          </h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-black/58">
          Live coverage, sharp analysis and public-interest reporting from Solakuti's newsroom.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px_280px]">
        <FeaturedArticle article={featured} />
        <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-1">
          {sideStories.map((article) => (
            <ArticleCard key={article.id} article={article} compact />
          ))}
        </div>
        <aside className="border-y-2 border-black bg-white xl:border-y-0 xl:border-l-2 xl:pl-5">
          <div className="py-4 xl:py-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Latest briefing</p>
            <div className="mt-3 divide-y divide-black/10">
              {briefingStories.map((article) => (
                <article key={article.id} className="py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/38">{article.category}</p>
                  <LoadingLink href={`/article/${article.slug}`} className="mt-1 block text-base font-black leading-tight tracking-[-0.03em] text-[#111] transition hover:text-red-600">
                    {article.title}
                  </LoadingLink>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
