import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Facebook, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import CommentsSection from "@/components/CommentsSection";
import { getArticleBySlug, getArticleComments, getArticles, getLatestArticles } from "@/lib/api";
import { categoryToSlug, formatDate, getRelatedArticles } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found"
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image, width: 1200, height: 630, alt: article.title }],
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author]
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, allArticles, latestArticles] = await Promise.all([
    getArticleBySlug(slug),
    getArticles(),
    getLatestArticles()
  ]);

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article, allArticles, 3);
  const comments = await getArticleComments(article.id);
  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const shareText = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(articleUrl);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.image],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: [
      {
        "@type": "Person",
        name: article.author
      }
    ],
    publisher: {
      "@type": "Organization",
      name: "Solakuti",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/solakuti-logo-transparent.png`
      }
    },
    mainEntityOfPage: articleUrl,
    articleSection: article.category
  };
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
            <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-[#111] sm:text-6xl lg:text-7xl">
              {article.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/62">{article.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-bold text-black/50">
              <span>{article.author}</span>
              <span className="size-1 rounded-full bg-black/20" />
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              <span className="size-1 rounded-full bg-black/20" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        <div className="container-page">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-black editorial-shadow">
            <Image
              src={article.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
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
            <div className="prose prose-lg max-w-none">
              {article.body.map((paragraph) => (
                <p key={paragraph} className="mb-7 text-xl leading-9 tracking-[-0.015em] text-black/76">
                  {paragraph}
                </p>
              ))}
            </div>
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
