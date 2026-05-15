import { articles as fallbackArticles, featuredArticle as fallbackFeaturedArticle, trendingArticles as fallbackTrendingArticles } from "@/data/articles";
import { Article, ArticleCategory, Category, Comment } from "@/types/article";
import { categories as fallbackCategories, categoryToSlug } from "@/lib/utils";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  };
};

type BackendCategory = {
  id: number;
  name: ArticleCategory;
  slug: string;
  description: string;
  featured_image_url?: string | null;
  articles_count?: number;
};

type BackendUser = {
  id?: number;
  full_name: string;
  email?: string;
  role?: "admin" | "editor" | "journalist" | "contributor";
};

type BackendArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image_url?: string | null;
  category: BackendCategory;
  author: BackendUser;
  is_featured: boolean;
  is_breaking: boolean;
  views_count: number;
  reading_time: number;
  published_at: string;
};

type BackendComment = {
  id: number;
  article: number;
  user: BackendUser;
  content: string;
  created_at: string;
  is_approved: boolean;
  replies: BackendComment[];
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: BackendUser;
};

type RegisterResponse = BackendUser & {
  id: number;
  email: string;
};

export type AdminOverview = {
  total_articles: number;
  total_views: number;
  total_comments: number;
  trending_articles: BackendArticle[];
  popular_categories: Array<{
    id: number;
    name: string;
    slug: string;
    articles_count: number;
    views_count: number | null;
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const IS_PRODUCTION_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 1200);

const categoryImageFallback: Record<ArticleCategory, string> = {
  Politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  "Breaking News": "https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=1200&q=80",
  Economy: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  "Security News": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
  Entertainment: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
  Opinions: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  Nigeria: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
};

async function fetchApi<T>(path: string): Promise<T | null> {
  if (IS_PRODUCTION_BUILD) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function mutateApi<T>(
  path: string,
  body: Record<string, unknown>,
  token?: string
): Promise<ApiResponse<T> | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });

    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok) {
      return payload;
    }
    return payload;
  } catch {
    return null;
  }
}

async function authApi<T>(path: string, token: string): Promise<ApiResponse<T> | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });
    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok) {
      return payload;
    }
    return payload;
  } catch {
    return null;
  }
}

function mapCategory(category: BackendCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    description: category.description,
    featuredImage: category.featured_image_url ?? null,
    articlesCount: category.articles_count
  };
}

function mapArticle(article: BackendArticle): Article {
  const fallback = fallbackArticles.find((item) => item.slug === article.slug);
  const body = article.content
    ? article.content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : fallback?.body ?? [];

  return {
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category.name,
    author: article.author.full_name,
    publishedAt: article.published_at,
    readTime: `${article.reading_time} min read`,
    image: article.featured_image_url ?? fallback?.image ?? categoryImageFallback[article.category.name],
    featured: article.is_featured,
    trending: article.views_count >= 2500,
    body
  };
}

function mapComment(comment: BackendComment): Comment {
  return {
    id: String(comment.id),
    article: String(comment.article),
    user: comment.user.full_name,
    content: comment.content,
    createdAt: comment.created_at,
    isApproved: comment.is_approved,
    replies: (comment.replies ?? []).map(mapComment)
  };
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchApi<BackendCategory[]>("/categories/");
  if (!data) {
    return fallbackCategories.map((category, index) => ({
      id: String(index + 1),
      name: category,
      slug: categoryToSlug(category),
      description: `Latest ${category.toLowerCase()} coverage from Solakuti.`,
      featuredImage: categoryImageFallback[category],
      articlesCount: fallbackArticles.filter((article) => article.category === category).length
    }));
  }
  return data.map(mapCategory);
}

export async function getArticles(): Promise<Article[]> {
  const data = await fetchApi<BackendArticle[]>("/articles/");
  return data ? data.map(mapArticle) : fallbackArticles;
}

export async function getFeaturedArticle(): Promise<Article> {
  const data = await fetchApi<BackendArticle[]>("/articles/featured/?page_size=1");
  return data?.[0] ? mapArticle(data[0]) : fallbackFeaturedArticle;
}

export async function getLatestArticles(): Promise<Article[]> {
  const data = await fetchApi<BackendArticle[]>("/articles/latest/");
  return data ? data.map(mapArticle) : fallbackArticles;
}

export async function getTrendingArticles(): Promise<Article[]> {
  const data = await fetchApi<BackendArticle[]>("/articles/trending/");
  return data ? data.map(mapArticle) : fallbackTrendingArticles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await fetchApi<BackendArticle>(`/articles/${slug}/`);
  if (data) {
    return mapArticle(data);
  }
  return fallbackArticles.find((article) => article.slug === slug) ?? null;
}

export async function getCategoryArticles(slug: string): Promise<Article[]> {
  const data = await fetchApi<BackendArticle[]>(`/categories/${slug}/articles/`);
  if (data) {
    return data.map(mapArticle);
  }
  return fallbackArticles.filter((article) => categoryToSlug(article.category) === slug);
}

export async function searchArticles(query: string): Promise<Article[]> {
  if (!query.trim()) {
    return [];
  }
  const data = await fetchApi<BackendArticle[]>(`/search/?q=${encodeURIComponent(query)}`);
  if (data) {
    return data.map(mapArticle);
  }
  const normalized = query.toLowerCase();
  return fallbackArticles.filter((article) =>
    [article.title, article.excerpt, article.category, article.author, article.body.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export async function getArticleComments(articleId: string): Promise<Comment[]> {
  const data = await fetchApi<BackendComment[]>(`/comments/?article=${encodeURIComponent(articleId)}`);
  return data ? data.map(mapComment) : [];
}

export async function login(email: string, password: string) {
  return mutateApi<LoginResponse>("/auth/login/", { email, password });
}

export async function register(fullName: string, email: string, password: string) {
  return mutateApi<RegisterResponse>("/auth/register/", {
    full_name: fullName,
    email,
    password
  });
}

export async function postComment(articleId: string, content: string, token: string, parent?: string) {
  return mutateApi<BackendComment>(
    "/comments/",
    {
      article: Number(articleId),
      content,
      ...(parent ? { parent: Number(parent) } : {})
    },
    token
  );
}

export async function getAdminOverview(token: string) {
  return authApi<AdminOverview>("/analytics/overview/", token);
}

export async function getAdminArticles(token: string) {
  const response = await authApi<BackendArticle[]>("/articles/?page_size=8", token);
  if (!response?.success || !response.data) {
    return response
      ? { ...response, data: [] as Article[] }
      : null;
  }
  return {
    ...response,
    data: response.data.map(mapArticle)
  };
}
