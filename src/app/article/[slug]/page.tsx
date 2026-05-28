import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye, Facebook, Linkedin, Mail, MessageCircle, Twitter, User } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/AdSlot";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import CommentsSection from "@/components/CommentsSection";
import ReadingProgress from "@/components/ReadingProgress";
import CategoryTracker from "@/components/CategoryTracker";
import RelativeTime from "@/components/RelativeTime";
import NewsletterSignupForm from "@/components/NewsletterSignupForm";
import { ApiUnavailableError, getArticleBySlug, getArticleComments, getLatestArticles } from "@/lib/api";
import {
  LOGO_URL,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  stripHtml,
  truncateDescription
} from "@/lib/seo";
import { categoryToSlug, formatDate, getRelatedArticles } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  let article: Awaited<ReturnType<typeof getArticleBySlug>> = null;
  try {
    article = await getArticleBySlug(slug, { trackView: false });
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return {
        title: "Story temporarily unavailable",
        robots: { index: false, follow: true }
      };
    }
    throw error;
  }

  if (!article) {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const sourceImage = absoluteUrl(article.ogImage || article.image);
  const title = article.seoTitle || article.title;
  const description = truncateDescription(article.seoDescription || article.excerpt);
  const images = [{ url: sourceImage, secureUrl: sourceImage, width: 1200, height: 630, alt: article.title }];

  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl || articleUrl },
    keywords: [article.category, ...(article.tags ?? [])],
    openGraph: {
      title, description, url: articleUrl, siteName: SITE_NAME, images,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author],
      section: article.category,
      tags: article.tags
    },
    twitter: { card: "summary_large_image", title, description, images: [sourceImage] },
    other: {
      "og:image": sourceImage,
      "og:image:secure_url": sourceImage,
      "og:image:width": "1200",
      "og:image:height": "630",
      "twitter:image": sourceImage,
      "solakuti:featured_image": sourceImage
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  let article: Awaited<ReturnType<typeof getArticleBySlug>> = null;
  let latestArticles: Awaited<ReturnType<typeof getLatestArticles>> = [];
  try {
    [article, latestArticles] = await Promise.all([
      getArticleBySlug(slug),
      getLatestArticles()
    ]);
  } catch (error) {
    if (error instanceof ApiUnavailableError) return <ArticleTemporarilyUnavailable />;
    throw error;
  }

  if (!article) notFound();

  const related = getRelatedArticles(article, latestArticles, 3);
  const comments = await getArticleComments(article.id);
  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const categoryUrl = `${SITE_URL}/category/${categoryToSlug(article.category)}`;
  const authorUrl = article.authorSlug ? `${SITE_URL}/author/${article.authorSlug}` : undefined;
  const sourceImage = absoluteUrl(article.ogImage || article.image);
  const articleText = stripHtml(article.contentHtml || article.body.join(" "));
  const shareText = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(articleUrl);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.seoTitle || article.title,
    description: truncateDescription(article.seoDescription || article.excerpt),
    image: [sourceImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: [{ "@type": "Person", name: article.author, url: authorUrl }],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 }
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": article.canonicalUrl || articleUrl },
    articleSection: article.category,
    keywords: article.tags?.join(", "),
    wordCount: articleText ? articleText.split(/\s+/).length : undefined,
    isAccessibleForFree: true,
    inLanguage: "en-NG"
  };

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: article.category, url: categoryUrl },
    { name: article.title, url: articleUrl }
  ]);

  const shareLinks = [
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, icon: Twitter },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, icon: Facebook },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, icon: Linkedin },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${shareText}%20${shareUrl}`, icon: MessageCircle },
    { label: "Share by email", href: `mailto:?subject=${shareText}&body=${shareUrl}`, icon: Mail }
  ];

  return (
    <main className="bg-[#f7f4ef]">
      <ReadingProgress />
      <CategoryTracker category={article.category} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <BreakingNewsBar articles={latestArticles} />

      {/* ── Dark editorial header ── */}
      <header className="border-b border-white/8 bg-[#111] text-white">
        <div className="container-page pb-10 pt-8 lg:pb-14 lg:pt-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white/30">
            <Link href="/" className="transition hover:text-white/70">Home</Link>
            <span>/</span>
            <Link href={`/category/${categoryToSlug(article.category)}`} className="transition hover:text-white/70">
              {article.category}
            </Link>
          </nav>

          {/* Category + flags */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              href={`/category/${categoryToSlug(article.category)}`}
              className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
            >
              {article.category}
            </Link>
            {article.breaking && (
              <span className="rounded-full border border-red-500/40 bg-red-600/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-400">
                Breaking
              </span>
            )}
            {article.trending && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-400">
                Trending
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
            {article.excerpt}
          </p>

          {/* Byline */}
          <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              {article.authorImage ? (
                <Image
                  src={article.authorImage}
                  alt={article.author}
                  width={44}
                  height={44}
                  className="rounded-full object-cover ring-2 ring-white/15"
                />
              ) : (
                <div className="grid size-11 place-items-center rounded-full bg-white/10">
                  <User className="size-5 text-white/40" aria-hidden="true" />
                </div>
              )}
              <div>
                {article.authorSlug ? (
                  <Link href={`/author/${article.authorSlug}`} className="block text-sm font-black text-white transition hover:text-red-400">
                    {article.author}
                  </Link>
                ) : (
                  <span className="block text-sm font-black text-white">{article.author}</span>
                )}
                {article.authorRole && (
                  <span className="block text-xs text-white/40">{article.authorRole}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/40">
              <RelativeTime date={article.publishedAt} />
              <span className="size-1 rounded-full bg-white/20" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden="true" />
                {article.readTime}
              </span>
              {article.viewsCount != null && article.viewsCount > 0 && (
                <>
                  <span className="size-1 rounded-full bg-white/20" />
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-3.5" aria-hidden="true" />
                    {article.viewsCount.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero image — full bleed ── */}
      {article.featuredMediaType === "video" && article.featuredVideo ? (
        <div className="bg-[#0a0a0a]">
          <div className="container-page py-0">
            <div className="relative aspect-[16/9] overflow-hidden">
              <video
                poster={article.image}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
              >
                <source src={article.featuredVideo} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative aspect-[16/9] max-h-[600px] w-full overflow-hidden bg-[#0a0a0a]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      )}

      {/* ── Article body ── */}
      <article>
        <div className="container-page py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[72px_minmax(0,1fr)_300px]">

            {/* Share sidebar — desktop */}
            <aside className="hidden lg:block" aria-label="Share article">
              <div className="sticky top-24 flex flex-col items-center gap-2">
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-black/30">Share</p>
                {shareLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    className="grid size-10 place-items-center rounded-full border border-black/10 bg-white text-black/50 shadow-sm transition hover:border-black hover:bg-black hover:text-white"
                    aria-label={label}
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </aside>

            {/* Article content */}
            <div className="min-w-0">
              {article.contentHtml ? (
                <div className="article-body" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
              ) : (
                <div>
                  {article.body.slice(0, Math.ceil(article.body.length / 2)).map((paragraph) => (
                    <p key={paragraph} className="mb-7 text-xl leading-9 tracking-[-0.015em] text-black/76">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Mid-article ad */}
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID ?? ""} className="my-8" />

              {/* In-article related */}
              {related.length > 0 && (
                <div className="my-10 rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">More from {article.category}</p>
                  <div className="mt-3 divide-y divide-black/6">
                    {related.slice(0, 2).map((item) => (
                      <Link
                        key={item.id}
                        href={`/article/${item.slug}`}
                        className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="relative mt-0.5 size-14 shrink-0 overflow-hidden rounded-md bg-black/5">
                          <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                        </div>
                        <p className="text-sm font-bold leading-snug text-black/75 transition group-hover:text-red-600">
                          {item.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!article.contentHtml && (
                <div>
                  {article.body.slice(Math.ceil(article.body.length / 2)).map((paragraph) => (
                    <p key={paragraph} className="mb-7 text-xl leading-9 tracking-[-0.015em] text-black/76">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 border-t border-black/8 pt-8">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/35">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-bold text-black/60 transition hover:border-black hover:bg-black hover:text-white"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile share */}
              <div className="mt-10 border-t border-black/8 pt-8 lg:hidden">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/35">Share this story</p>
                <div className="flex flex-wrap gap-2">
                  {shareLinks.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold text-black/60 transition hover:border-black hover:bg-black hover:text-white"
                      aria-label={label}
                    >
                      <Icon className="size-3.5" />
                      {label.replace("Share on ", "").replace("Share by ", "")}
                    </a>
                  ))}
                </div>
              </div>

              {/* Author card */}
              {(article.authorBio || article.authorImage) && (
                <div className="mt-10 flex gap-5 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
                  {article.authorImage ? (
                    <Image
                      src={article.authorImage}
                      alt={article.author}
                      width={64}
                      height={64}
                      className="size-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid size-16 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
                      <User className="size-7" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Written by</p>
                    {article.authorSlug ? (
                      <Link href={`/author/${article.authorSlug}`} className="mt-1 block text-lg font-black tracking-[-0.03em] transition hover:text-red-600">
                        {article.author}
                      </Link>
                    ) : (
                      <p className="mt-1 text-lg font-black tracking-[-0.03em]">{article.author}</p>
                    )}
                    {article.authorRole && (
                      <p className="text-xs font-bold text-black/45">{article.authorRole}</p>
                    )}
                    {article.authorBio && (
                      <p className="mt-2 text-sm leading-6 text-black/60">{article.authorBio}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="hidden lg:block" aria-label="Sidebar">
              <div className="sticky top-24 space-y-6">
                {/* More from category */}
                {related.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                    <div className="border-b border-black/6 px-5 py-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">More from</p>
                      <Link
                        href={`/category/${categoryToSlug(article.category)}`}
                        className="mt-0.5 block text-base font-black tracking-[-0.03em] transition hover:text-red-600"
                      >
                        {article.category}
                      </Link>
                    </div>
                    <div className="divide-y divide-black/6">
                      {related.map((item) => (
                        <Link
                          key={item.id}
                          href={`/article/${item.slug}`}
                          className="group flex items-start gap-3 p-4 transition hover:bg-black/[0.02]"
                        >
                          <div className="relative mt-0.5 size-14 shrink-0 overflow-hidden rounded-md bg-black/5">
                            <Image src={item.image} alt="" fill sizes="56px" className="object-cover transition duration-300 group-hover:scale-105" />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-3 text-sm font-bold leading-snug text-black/75 transition group-hover:text-red-600">
                              {item.title}
                            </p>
                            <p className="mt-1.5 text-xs text-black/35">{formatDate(item.publishedAt)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-[#111] p-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Stay informed</p>
                  <p className="mt-1.5 text-base font-black leading-tight tracking-[-0.03em]">
                    Get the Solakuti morning edit.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Sharp Nigerian headlines delivered to your inbox each morning.
                  </p>
                  <div className="mt-4">
                    <NewsletterSignupForm source="article-sidebar" compact dark />
                  </div>
                </div>

                {/* Published info */}
                <div className="rounded-xl border border-black/10 bg-white p-5 text-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">Published</p>
                  <p className="mt-1.5 font-bold text-black/70">{formatDate(article.publishedAt)}</p>
                  {article.updatedAt && article.updatedAt !== article.publishedAt && (
                    <>
                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/35">Updated</p>
                      <p className="mt-1.5 font-bold text-black/70">{formatDate(article.updatedAt)}</p>
                    </>
                  )}
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/35">Category</p>
                  <Link
                    href={`/category/${categoryToSlug(article.category)}`}
                    className="mt-1.5 block font-bold text-red-600 transition hover:text-black"
                  >
                    {article.category}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ── Comments ── */}
      <CommentsSection articleId={article.id} initialComments={comments} />

      {/* ── Related stories ── */}
      {related.length > 0 && (
        <section className="border-t border-black/10 bg-white" aria-label="Related stories">
          <div className="container-page py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600">Keep reading</p>
                <h2 className="mt-1.5 text-3xl font-black tracking-[-0.05em] text-[#111]">Related stories</h2>
              </div>
              <Link
                href={`/category/${categoryToSlug(article.category)}`}
                className="shrink-0 text-sm font-black text-black/45 transition hover:text-red-600"
              >
                All {article.category} →
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} compact />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function ArticleTemporarilyUnavailable() {
  return (
    <main className="min-h-[70vh] bg-[#111] text-white">
      <section className="container-page py-16 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Connection delay</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
          This story is taking longer than expected to load.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
          The article link is valid, but the newsroom API did not respond in time. Please refresh the page in a moment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex h-11 items-center rounded-full bg-red-600 px-5 text-sm font-black text-white transition hover:bg-white hover:text-black">
            Go home
          </Link>
          <Link href="/search" className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-black text-white/70 transition hover:border-white hover:text-white">
            Search stories
          </Link>
        </div>
      </section>
    </main>
  );
}
