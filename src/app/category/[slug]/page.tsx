import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/AdSlot";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import TrendingSidebar from "@/components/TrendingSidebar";
import { Clock } from "lucide-react";
import { getArticles, getCategories, getCategoryArticles, getLatestArticles, getTrendingArticles } from "@/lib/api";
import { SITE_URL, buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [categories, categoryArticles] = await Promise.all([
    getCategories(),
    getCategoryArticles(slug)
  ]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false }
    };
  }

  return buildPageMetadata({
    title: `${category.name} News`,
    description: category.description || `Latest ${category.name.toLowerCase()} coverage from Solakuti.`,
    path: `/category/${category.slug}`,
    image: category.featuredImage,
    imageAlt: `${category.name} news on Solakuti`,
    noIndex: categoryArticles.length === 0
  });
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
  const heroImage = category?.featuredImage ?? categoryArticles[0]?.image ?? null;
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: categoryName, url: `${SITE_URL}/category/${slug}` }
  ]);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} News`,
    description: category?.description || `Latest ${categoryName.toLowerCase()} coverage from Solakuti.`,
    url: `${SITE_URL}/category/${slug}`,
    isPartOf: { "@type": "WebSite", name: "Solakuti", url: SITE_URL }
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <BreakingNewsBar articles={latestArticles.length ? latestArticles : allArticles} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#111] text-white">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent" />
        <div className="container-page relative py-10 sm:py-14 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{categoryName}</span>
          </nav>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">Solakuti desk</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            {categoryName}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
            {category?.description || `The latest reporting, analysis and context from Solakuti's ${categoryName.toLowerCase()} coverage.`}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm font-bold text-white/40">
            <span>{categoryArticles.length} stories</span>
          </div>

          {/* Category pills */}
          <div className="mt-7 flex flex-wrap gap-2">
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                  item.slug === slug
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-white/12 text-white/55 hover:border-white hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-page grid gap-8 py-8 sm:py-10 lg:grid-cols-[1fr_340px]">
        <div>
          {categoryArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/12 bg-[#faf8f4] p-10 text-center">
              <p className="text-base font-bold text-black/50">No articles in this category yet.</p>
            </div>
          ) : (
            <>
              {/* Featured first article */}
              <Link
                href={`/article/${categoryArticles[0].slug}`}
                className="group relative mb-5 block overflow-hidden rounded-xl bg-black"
              >
                <div className="relative aspect-[21/9] min-h-[220px] overflow-hidden">
                  <Image
                    src={categoryArticles[0].image}
                    alt={categoryArticles[0].title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                    <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                      {categoryArticles[0].category}
                    </span>
                    <h2 className="mt-3 text-xl font-black leading-tight tracking-[-0.04em] text-white sm:text-2xl lg:text-3xl">
                      {categoryArticles[0].title}
                    </h2>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-white/65">
                      {categoryArticles[0].excerpt}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-white/45">
                      <span>{categoryArticles[0].author}</span>
                      <span className="size-1 rounded-full bg-white/30" />
                      <span>{formatDate(categoryArticles[0].publishedAt)}</span>
                      <span className="size-1 rounded-full bg-white/30" />
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {categoryArticles[0].readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card grid */}
              {categoryArticles.length > 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {categoryArticles.slice(1, 5).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </>
          )}

          {categoryArticles.length > 5 && (
            <>
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_MID ?? ""} className="my-6" />
              <div className="grid gap-5 sm:grid-cols-2">
                {categoryArticles.slice(5, 13).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}

          {categoryArticles.length > 13 && (
            <div className="grid gap-5 pt-5 sm:grid-cols-2">
              {categoryArticles.slice(13).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <TrendingSidebar articles={trendingArticles.concat(allArticles)} />
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_SIDEBAR ?? ""} format="rectangle" />
        </aside>
      </section>
    </main>
  );
}
