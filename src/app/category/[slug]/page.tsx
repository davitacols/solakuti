import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import LoadingButton from "@/components/LoadingButton";
import TrendingSidebar from "@/components/TrendingSidebar";
import { getArticles, getCategories, getCategoryArticles, getLatestArticles, getTrendingArticles } from "@/lib/api";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Category not found"
    };
  }

  return {
    title: `${category.name} News`,
    description: category.description || `Latest ${category.name.toLowerCase()} coverage from Solakuti.`
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [allArticles, categoryArticles, latestArticles, trendingArticles, categories] = await Promise.all([
    getArticles(),
    getCategoryArticles(slug),
    getLatestArticles(),
    getTrendingArticles(),
    getCategories()
  ]);
  const category = categories.find((item) => item.slug === slug);

  if (!category && categoryArticles.length === 0) {
    notFound();
  }
  const categoryName = category?.name ?? categoryArticles[0]?.category ?? "News";

  return (
    <main>
      <BreakingNewsBar articles={latestArticles.length ? latestArticles : allArticles} />
      <section className="bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Solakuti desk</p>
          <h1 className="mt-3 text-5xl font-black leading-none tracking-[-0.07em] sm:text-7xl">
            {categoryName}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">
            {category?.description || `The latest reporting, analysis and context from Solakuti's ${categoryName.toLowerCase()} coverage.`}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((item) => (
              <a
                key={item.slug}
                href={`/category/${item.slug}`}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  item.slug === slug
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-white/12 text-white/62 hover:border-white hover:text-white"
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="grid gap-5 md:grid-cols-2">
            {categoryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <nav className="mt-9 flex items-center justify-center gap-2" aria-label="Pagination">
            {[1, 2, 3].map((page) => (
              <LoadingButton
                key={page}
                type="button"
                className={`grid size-11 place-items-center rounded-full border text-sm font-black transition ${
                  page === 1
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black/60 hover:border-black hover:text-black"
                }`}
              >
                {page}
              </LoadingButton>
            ))}
          </nav>
        </div>
        <TrendingSidebar articles={trendingArticles.concat(allArticles)} />
      </section>
    </main>
  );
}
