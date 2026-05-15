import { Article, ArticleCategory } from "@/types/article";

export const categories: ArticleCategory[] = [
  "Politics",
  "Breaking News",
  "Economy",
  "Security News",
  "Entertainment",
  "Opinions",
  "Nigeria"
];

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export function categoryToSlug(category: ArticleCategory) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function slugToCategory(slug: string): ArticleCategory | undefined {
  return categories.find((category) => categoryToSlug(category) === slug);
}

export function getRelatedArticles(article: Article, articles: Article[], limit = 3) {
  return articles
    .filter((item) => item.category === article.category && item.id !== article.id)
    .concat(articles.filter((item) => item.category !== article.category && item.id !== article.id))
    .slice(0, limit);
}
