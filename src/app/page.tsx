import ArticleCard from "@/components/ArticleCard";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import CategorySection from "@/components/CategorySection";
import HeroSection from "@/components/HeroSection";
import NewsletterSection from "@/components/NewsletterSection";
import TrendingSidebar from "@/components/TrendingSidebar";
import { getArticles, getCategories, getFeaturedArticle, getLatestArticles, getTrendingArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

const categoryKickers: Record<string, string> = {
  Politics: "Power watch",
  Entertainment: "Culture desk",
  Economy: "Markets and money",
  "Security News": "Safety brief",
  Crime: "Crime watch",
  Health: "Health desk",
  "National Assembly": "Assembly watch",
  Tech: "Tech desk",
  "World News": "Global brief",
  "General News": "Public square",
  Opinions: "Argument",
  Nigeria: "Nation brief",
  "Breaking News": "Developing now"
};

function getKicker(category: string) {
  return categoryKickers[category] ?? "Solakuti desk";
}

export default async function Home() {
  const [articles, featuredArticle, latestArticles, trendingArticles, categories] = await Promise.all([
    getArticles(),
    getFeaturedArticle(),
    getLatestArticles(),
    getTrendingArticles(),
    getCategories()
  ]);
  const liveArticles = latestArticles.length ? latestArticles : articles;
  const liveFeatured = liveArticles.find((article) => article.featured) ?? featuredArticle ?? liveArticles[0];
  const latest = liveArticles.filter((article) => article.id !== liveFeatured.id).slice(0, 8);
  const feed = liveArticles.filter((article) => article.id !== liveFeatured.id);
  const activeCategories = categories
    .map((category) => ({
      ...category,
      articles: liveArticles.filter((article) => article.category === category.name)
    }))
    .filter((category) => category.articles.length > 0)
    .sort((a, b) => b.articles.length - a.articles.length);

  return (
    <main>
      <BreakingNewsBar articles={liveArticles} />
      <HeroSection featured={liveFeatured} secondary={latest} />

      <section className="container-page grid gap-8 py-8 xl:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4 border-t-2 border-black pt-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
                Developing feed
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111] sm:text-5xl">
                Latest from the news desk
              </h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {feed.slice(0, 9).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        <TrendingSidebar articles={trendingArticles.concat(liveArticles)} />
      </section>

      <section className="container-page">
        {activeCategories.map((category) => (
          <CategorySection
            key={category.slug}
            title={category.name}
            slug={category.slug}
            kicker={getKicker(category.name)}
            articles={category.articles}
          />
        ))}
      </section>

      <NewsletterSection />
    </main>
  );
}
