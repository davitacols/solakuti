import { notFound } from "next/navigation";
import { getCategories, getLatestArticles } from "@/lib/api";
import { buildRssFeed, SITE_URL, xmlResponse } from "@/lib/feed";

type CategoryFeedProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: CategoryFeedProps) {
  const { slug } = await params;
  const [categories, articles] = await Promise.all([getCategories(), getLatestArticles()]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryArticles = articles.filter((article) => article.category === category.name);
  return xmlResponse(
    buildRssFeed({
      title: `Solakuti ${category.name}`,
      description: category.description || `Latest ${category.name} reports from Solakuti.`,
      link: `${SITE_URL}/category/${category.slug}`,
      articles: categoryArticles
    })
  );
}
