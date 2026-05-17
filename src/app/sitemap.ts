import type { MetadataRoute } from "next";
import { getArticles, getCategories } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()]);
  const now = new Date();
  const authorSlugs = Array.from(new Set(articles.map((article) => article.authorSlug).filter(Boolean)));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5
    },
    ...["about", "contact", "editorial-policy", "privacy-policy", "advertise"].map((page) => ({
      url: `${SITE_URL}/${page}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8
    })),
    ...authorSlugs.map((slug) => ({
      url: `${SITE_URL}/author/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/article/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "daily" as const,
      priority: article.featured ? 0.9 : 0.7
    }))
  ];
}
