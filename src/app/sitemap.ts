import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/api";
import { categories, categoryToSlug } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  const now = new Date();

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
    ...categories.map((category) => ({
      url: `${SITE_URL}/category/${categoryToSlug(category)}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/article/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "daily" as const,
      priority: article.featured ? 0.9 : 0.7
    }))
  ];
}
