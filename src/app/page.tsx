import ArticleCard from "@/components/ArticleCard";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import CategoryPills from "@/components/CategoryPills";
import CategorySection from "@/components/CategorySection";
import EditorsPick from "@/components/EditorsPick";
import HeroSection from "@/components/HeroSection";
import JustInTimeline from "@/components/JustInTimeline";
import LiveScoresStrip from "@/components/LiveScoresStrip";
import NewsletterSection from "@/components/NewsletterSection";
import TrendingSidebar from "@/components/TrendingSidebar";
import { getArticles, getCategories, getFeaturedArticle, getLatestArticles, getLiveFixtures, getResultFixtures, getTodayFixtures, getTrendingArticles, getUpcomingFixtures } from "@/lib/api";

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
  Sports: "Sports desk",
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
  const [articles, featuredArticle, latestArticles, trendingArticles, categories, liveFixtures, todayFixtures, upcomingFixtures, resultFixtures] = await Promise.all([
    getArticles(),
    getFeaturedArticle(),
    getLatestArticles(),
    getTrendingArticles(),
    getCategories(),
    getLiveFixtures(),
    getTodayFixtures(),
    getUpcomingFixtures(),
    getResultFixtures()
  ]);

  const breakingFixtures = [...liveFixtures, ...todayFixtures, ...upcomingFixtures.slice(0, 4), ...resultFixtures.slice(0, 4)]
    .filter((fixture, index, items) => items.findIndex((item) => item.id === fixture.id) === index)
    .slice(0, 8);

  const liveArticles = latestArticles.length ? latestArticles : articles;
  const liveFeatured = liveArticles.find((article) => article.featured) ?? featuredArticle ?? liveArticles[0];
  const latest = liveFeatured ? liveArticles.filter((article) => article.id !== liveFeatured.id).slice(0, 8) : [];
  const feed = liveFeatured ? liveArticles.filter((article) => article.id !== liveFeatured.id) : liveArticles;

  // Editor's pick: highest view count article that isn't the featured one
  const editorsPick = liveArticles
    .filter((a) => a.id !== liveFeatured?.id)
    .sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))[0] ?? null;

  const activeCategories = categories
    .map((category) => ({
      ...category,
      articles: liveArticles.filter((article) => article.category === category.name)
    }))
    .filter((category) => category.articles.length > 0)
    .sort((a, b) => b.articles.length - a.articles.length);

  return (
    <main>
      <BreakingNewsBar articles={liveArticles} fixtures={breakingFixtures} />
      <LiveScoresStrip fixtures={breakingFixtures} />

      {liveFeatured ? (
        <HeroSection featured={liveFeatured} secondary={latest} />
      ) : (
        <section className="container-page py-14">
          <div className="border-y-2 border-black py-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">Newsroom</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-[-0.06em] text-[#111] sm:text-6xl">
              No published stories yet.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-black/58">
              Publish articles from the admin desk and they will appear here automatically.
            </p>
          </div>
        </section>
      )}

      <CategoryPills categories={categories} />

      {editorsPick && <EditorsPick article={editorsPick} />}

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
            {feed.length === 0 && (
              <div className="border border-dashed border-black/20 bg-white p-6 text-sm font-bold text-black/45">
                No latest articles are available yet.
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <TrendingSidebar articles={trendingArticles.concat(liveArticles)} />
          <JustInTimeline articles={liveArticles} />
        </div>
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
