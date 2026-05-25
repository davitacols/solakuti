import type { MetadataRoute } from "next";
import { getArticles, getCategories, getSportsCompetitions, getSportsFixtures, getSportsTeams } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, competitions, teams, fixtures] = await Promise.all([
    getArticles(),
    getCategories(),
    getSportsCompetitions().catch(() => []),
    getSportsTeams().catch(() => []),
    getSportsFixtures().catch(() => [])
  ]);
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
    {
      url: `${SITE_URL}/livescores`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8
    },
    ...["about", "contact", "editorial-policy", "privacy-policy", "terms-of-use", "advertise"].map((page) => ({
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
    ...competitions.map((competition) => ({
      url: `${SITE_URL}/livescores/competition/${competition.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: competition.is_featured ? 0.75 : 0.65
    })),
    ...teams.slice(0, 300).map((team) => ({
      url: `${SITE_URL}/livescores/team/${team.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.55
    })),
    ...fixtures.slice(0, 200).map((fixture) => ({
      url: `${SITE_URL}/livescores/match/${fixture.id}`,
      lastModified: fixture.updated_at ? new Date(fixture.updated_at) : now,
      changeFrequency: fixture.status === "live" ? ("always" as const) : ("hourly" as const),
      priority: fixture.status === "live" ? 0.7 : 0.55
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/article/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "daily" as const,
      priority: article.featured ? 0.9 : 0.7
    }))
  ];
}
