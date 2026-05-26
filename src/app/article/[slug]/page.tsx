import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Facebook, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/AdSlot";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import CommentsSection from "@/components/CommentsSection";
import ReadingProgress from "@/components/ReadingProgress";
import CategoryTracker from "@/components/CategoryTracker";
import RelativeTime from "@/components/RelativeTime";
import { ApiUnavailableError, getArticleBySlug, getArticleComments, getArticles, getLatestArticles } from "@/lib/api";
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
    article = await getArticleBySlug(slug);
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return {
        title: "Story temporarily unavailable",
        robots: {
          index: false,
          follow: true
        }
      };
    }
    throw error;
  }

  if (!article) {
    return {
      title: "Article not found"
    };
  }

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const sourceImage = absoluteUrl(article.ogImage || article.image);
  const title = article.seoTitle || article.title;
  const description = truncateDescription(article.seoDescription || article.excerpt);
  const images = [
    {
      url: sourceImage,
      secureUrl: sourceImage,
      width: 1200,
      height: 630,
      alt: article.title
    }
  ];

  return {
    title,
    description,
    alternates: {
      canonical: article.canonicalUrl || articleUrl
    },
    keywords: [article.category, ...(article.tags ?? [])],
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: SITE_NAME,
      images,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author],
      section: article.category,
      tags: article.tags
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [sourceImage]
    },
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
  let allArticles: Awaited<ReturnType<typeof getArticles>> = [];
  let latestArticles: Awaited<ReturnType<typeof getLatestArticles>> = [];
  try {
    [article, allArticles, latestArticles] = await Promise.all([
      getArticleBySlug(slug),
      getArticles(),
      getLatestArticles()
    ]);
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return <ArticleTemporarilyUnavailable />;
    }
    throw error;
  }

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article, allArticles, 3);
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
    author: [
      {
        "@type": "Person",
        name: article.author,
        url: authorUrl
      }
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 512,
        height: 512
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.canonicalUrl || articleUrl
    },
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
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      icon: Twitter
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      icon: Facebook
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      icon: Linkedin
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      icon: MessageCircle
    },
    {
      label: "Share by email",
      href: `mailto:?subject=${shareText}&body=${shareUrl}`,
      icon: Mail
    }
  ];

  return (
    <main>
      <ReadingProgress />
      <CategoryTracker category={article.category} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BreakingNewsBar articles={latestArticles.length ? latestArticles : allArticles} />
      <article>
        <header className="container-page py-8 lg:py-12">
          <div className="max-w-4xl">
            <Link
              href={`/category/${categoryToSlug(article.category)}`}
              className="inline-flex rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white"
            >
              {article.category}
            </Link>
            <nav aria-label="Breadcrumb" className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-black/38">
              <Link href="/" className="transition hover:text-red-600">Home</Link>
              <span className="mx-2">/</span>
              <Link href={`/category/${categoryToSlug(article.category)}`} className="transition hover:text-red-600">
                {article.category}
              </Link>
            </nav>
            <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-[#111] sm:text-6xl lg:text-7xl">
              {article.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/62">{article.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-bold text-black/50">
              {article.authorSlug ? (
                <Link href={`/author/${article.authorSlug}`} className="text-black/70 transition hover:text-red-600">
                  {article.author}
                </Link>
              ) : (
                <span>{article.author}</span>
              )}
              <span className="size-1 rounded-full bg-black/20" />
              <RelativeTime date={article.publishedAt} className="text-sm font-bold text-black/50" />
              <span className="size-1 rounded-full bg-black/20" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        <div className="container-page">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-black editorial-shadow">
            {article.featuredMediaType === "video" && article.featuredVideo ? (
              <video
                poster={article.image}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
              >
                <source src={article.featuredVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <>
                <Image
                  src={article.image}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </>
            )}
          </div>
        </div>

        <div className="container-page grid gap-8 py-10 lg:grid-cols-[120px_minmax(0,760px)_1fr]">
          <aside className="order-2 flex gap-2 lg:order-1 lg:flex-col">
            {shareLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="grid size-11 place-items-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-black hover:bg-black hover:text-white"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </aside>

          <div className="order-1 lg:order-2">
            {article.contentHtml ? (
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                {article.body.slice(0, Math.ceil(article.body.length / 2)).map((paragraph) => (
                  <p key={paragraph} className="mb-7 text-xl leading-9 tracking-[-0.015em] text-black/76">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Mid-article ad */}
            <AdSlot slot="article-mid" className="my-8" />

            {/* Mid-article related */}
            {related.length > 0 && (
              <div className="my-8 rounded-xl border border-black/8 bg-[#faf8f4] p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-red-600">More from {article.category}</p>
                <div className="mt-3 divide-y divide-black/8">
                  {related.slice(0, 2).map((item) => (
                    <Link key={item.id} href={`/article/${item.slug}`} className="block py-3 text-sm font-bold text-[#111] transition hover:text-red-600">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!article.contentHtml && (
              <div className="prose prose-lg max-w-none">
                {article.body.slice(Math.ceil(article.body.length / 2)).map((paragraph) => (
                  <p key={paragraph} className="mb-7 text-xl leading-9 tracking-[-0.015em] text-black/76">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          <aside className="order-3 hidden lg:block">
            <div className="sticky top-28 rounded-lg border border-black/10 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Editor note</p>
              <p className="mt-3 text-sm leading-6 text-black/62">
                Solakuti reports are edited for context, clarity and public value.
              </p>
            </div>
          </aside>
        </div>
      </article>

      <CommentsSection articleId={article.id} initialComments={comments} />

      <section className="container-page border-t border-black/12 py-10">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Keep reading</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111]">Related stories</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ArticleCard key={item.id} article={item} compact />
          ))}
        </div>
      </section>
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
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-red-600 px-5 text-sm font-black text-white transition hover:bg-white hover:text-black"
          >
            Go home
          </Link>
          <Link
            href="/search"
            className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-black text-white/70 transition hover:border-white hover:text-white"
          >
            Search stories
          </Link>
        </div>
      </section>
    </main>
  );
}
