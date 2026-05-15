import ArticleCard from "@/components/ArticleCard";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import CategorySection from "@/components/CategorySection";
import HeroSection from "@/components/HeroSection";
import NewsletterSection from "@/components/NewsletterSection";
import TrendingSidebar from "@/components/TrendingSidebar";
import { getArticles, getFeaturedArticle, getLatestArticles, getTrendingArticles } from "@/lib/api";
import { ArticleCategory } from "@/types/article";

const sectionMeta: Array<{ title: ArticleCategory; kicker: string }> = [
  { title: "Politics", kicker: "Power watch" },
  { title: "Entertainment", kicker: "Culture desk" },
  { title: "Economy", kicker: "Markets and money" },
  { title: "Security News", kicker: "Safety brief" },
  { title: "Opinions", kicker: "Argument" }
];

export default async function Home() {
  const [articles, featuredArticle, latestArticles, trendingArticles] = await Promise.all([
    getArticles(),
    getFeaturedArticle(),
    getLatestArticles(),
    getTrendingArticles()
  ]);
  const latest = articles.filter((article) => article.id !== featuredArticle.id).slice(0, 6);
  const feed = latestArticles.filter((article) => article.id !== featuredArticle.id);

  return (
    <main>
      <BreakingNewsBar articles={latestArticles.length ? latestArticles : articles} />
      <HeroSection featured={featuredArticle} secondary={latest} />

      <section className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4 border-t border-black/12 pt-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
                Latest dispatches
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111] sm:text-4xl">
                The newsroom feed
              </h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {feed.slice(2, 6).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        <TrendingSidebar articles={trendingArticles.concat(articles)} />
      </section>

      <section className="container-page">
        {sectionMeta.map(({ title, kicker }) => (
          <CategorySection
            key={title}
            title={title}
            kicker={kicker}
            articles={articles.filter((article) => article.category === title)}
          />
        ))}
      </section>

      <NewsletterSection />
    </main>
  );
}
