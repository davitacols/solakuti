import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, User } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import { getArticles } from "@/lib/api";
import { SITE_NAME, SITE_URL, absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { categoryToSlug, formatDate, slugify } from "@/lib/utils";

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

function roleLabel(role?: string) {
  if (!role) return "Contributor";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticles();
  const authorArticles = articles.filter((a) => a.authorSlug === slug || slugify(a.author) === slug);
  const author = authorArticles[0];
  if (!author) return { title: "Author not found" };
  return buildPageMetadata({
    title: `${author.author} | ${SITE_NAME}`,
    description: author.authorBio || `Read the latest Solakuti reports by ${author.author}.`,
    path: `/author/${slug}`,
    image: author.authorImage,
    imageAlt: author.author,
    type: "profile"
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const articles = await getArticles();
  const authorArticles = articles
    .filter((a) => a.authorSlug === slug || slugify(a.author) === slug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const author = authorArticles[0];

  if (!author) notFound();

  // Category breakdown
  const categoryCount = authorArticles.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const authorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.author,
    url: `${SITE_URL}/author/${slug}`,
    image: author.authorImage ? absoluteUrl(author.authorImage) : undefined,
    jobTitle: roleLabel(author.authorRole),
    description: author.authorBio || undefined,
    worksFor: { "@type": "NewsMediaOrganization", name: "Solakuti", url: SITE_URL }
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }} />

      {/* Header */}
      <section className="border-b border-white/8 bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-8 text-[11px] font-black uppercase tracking-[0.14em] text-white/30">
            <Link href="/" className="transition hover:text-white/70">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/60">{author.author}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[160px_1fr] lg:items-start">
            {/* Avatar */}
            <div className="relative size-28 overflow-hidden rounded-full border-2 border-white/15 bg-white/8 lg:size-40">
              {author.authorImage ? (
                <Image src={author.authorImage} alt={author.author} fill sizes="160px" className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <User className="size-12 text-white/30" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="inline-block rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                {roleLabel(author.authorRole)}
              </span>
              <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                {author.author}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
                {author.authorBio || "Solakuti newsroom contributor covering stories with public value, context and clarity."}
              </p>

              {/* Stats row */}
              <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-2xl font-black tracking-[-0.04em]">{authorArticles.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Reports</p>
                </div>
                {topCategories.length > 0 && (
                  <div>
                    <p className="text-2xl font-black tracking-[-0.04em]">{topCategories.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Sections</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-black">{formatDate(authorArticles[authorArticles.length - 1].publishedAt)}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">First published</p>
                </div>
                <div>
                  <p className="text-sm font-black">{formatDate(authorArticles[0].publishedAt)}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Latest</p>
                </div>
              </div>

              {/* Category pills */}
              {topCategories.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">Covers:</span>
                  {topCategories.map(([cat, count]) => (
                    <Link
                      key={cat}
                      href={`/category/${categoryToSlug(cat)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white"
                    >
                      {cat}
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-white/45">{count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Article archive */}
      <section className="container-page py-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600">Author archive</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-[-0.05em] text-[#111] sm:text-3xl">
              All reports by {author.author}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs">
            <FileText className="size-3.5 text-black/40" />
            <span className="font-black text-black/60">{authorArticles.length}</span>
          </div>
        </div>

        {authorArticles.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {authorArticles.map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-black/12 bg-[#faf8f4] p-10 text-center">
            <p className="font-bold text-black/45">No published reports yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}
