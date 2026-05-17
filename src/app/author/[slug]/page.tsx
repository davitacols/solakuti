import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { getArticles } from "@/lib/api";
import { formatDate, slugify } from "@/lib/utils";

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com";

function roleLabel(role?: string) {
  if (!role) {
    return "Contributor";
  }
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticles();
  const authorArticles = articles.filter((article) => article.authorSlug === slug || slugify(article.author) === slug);
  const author = authorArticles[0];

  if (!author) {
    return {
      title: "Author not found"
    };
  }

  return {
    title: `${author.author} | Solakuti`,
    description: author.authorBio || `Read the latest Solakuti reports by ${author.author}.`,
    alternates: {
      canonical: `${SITE_URL}/author/${slug}`
    },
    openGraph: {
      title: `${author.author} | Solakuti`,
      description: author.authorBio || `Read the latest Solakuti reports by ${author.author}.`,
      url: `${SITE_URL}/author/${slug}`,
      siteName: "Solakuti",
      type: "profile",
      images: author.authorImage ? [{ url: author.authorImage, width: 400, height: 400, alt: author.author }] : undefined
    }
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const articles = await getArticles();
  const authorArticles = articles
    .filter((article) => article.authorSlug === slug || slugify(article.author) === slug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const author = authorArticles[0];

  if (!author) {
    notFound();
  }

  const authorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.author,
    url: `${SITE_URL}/author/${slug}`,
    image: author.authorImage || undefined,
    jobTitle: roleLabel(author.authorRole),
    description: author.authorBio || undefined,
    worksFor: {
      "@type": "NewsMediaOrganization",
      name: "Solakuti",
      url: SITE_URL
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />
      <section className="border-b border-black/10 bg-[#111] text-white">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-end">
          <div className="relative size-32 overflow-hidden rounded-full border border-white/15 bg-white/10 lg:size-40">
            {author.authorImage ? (
              <Image src={author.authorImage} alt={author.author} fill sizes="160px" className="object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-5xl font-black tracking-[-0.06em] text-white">
                {author.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">{roleLabel(author.authorRole)}</p>
            <h1 className="mt-3 text-5xl font-black leading-none tracking-[-0.07em] sm:text-7xl">{author.author}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
              {author.authorBio || "Solakuti newsroom contributor covering stories with public value, context and clarity."}
            </p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-white/38">
              {authorArticles.length} reports - Latest {formatDate(authorArticles[0].publishedAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <nav aria-label="Breadcrumb" className="mb-7 text-xs font-black uppercase tracking-[0.16em] text-black/38">
          <Link href="/" className="transition hover:text-red-600">Home</Link>
          <span className="mx-2">/</span>
          <span>{author.author}</span>
        </nav>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Author archive</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111]">Latest by {author.author}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {authorArticles.map((article) => (
            <ArticleCard key={article.id} article={article} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
