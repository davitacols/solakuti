import ArticleCard from "@/components/ArticleCard";
import FeaturedArticle from "@/components/FeaturedArticle";
import { Article } from "@/types/article";

type HeroSectionProps = {
  featured: Article;
  secondary: Article[];
};

export default function HeroSection({ featured, secondary }: HeroSectionProps) {
  return (
    <section className="container-page py-8 lg:py-12">
      <div className="mb-7 flex flex-col justify-between gap-4 border-b border-black/12 pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">
            Nigeria in focus
          </p>
          <h2 className="mt-2 max-w-3xl text-4xl font-black leading-none tracking-[-0.06em] text-[#111] sm:text-5xl">
            Signal over noise from the new African newsroom.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-black/58">
          Premium reporting on power, money, culture and public life across Nigeria.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <FeaturedArticle article={featured} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {secondary.slice(0, 2).map((article) => (
            <ArticleCard key={article.id} article={article} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
