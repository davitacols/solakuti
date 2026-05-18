import { articles as fallbackArticles, featuredArticle as fallbackFeaturedArticle, trendingArticles as fallbackTrendingArticles } from "@/data/articles";
import { Article, ArticleCategory, Category, Comment } from "@/types/article";
import { categories as fallbackCategories, categoryToSlug, slugify } from "@/lib/utils";

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
  profile_image_url?: string | null;
  role?: "admin" | "editor" | "journalist" | "contributor";
  bio?: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string;
};

type BackendArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image_url?: string | null;
  featured_video_url?: string | null;
  featured_media_type?: "image" | "video";
  og_image_url?: string | null;
  category: BackendCategory;
  author: BackendUser;
  tags?: Array<{ id: number; name: string; slug: string }>;
  is_featured: boolean;
  is_breaking: boolean;
  is_published?: boolean;
  editorial_status?: "draft" | "review" | "published";
  views_count: number;
  reading_time: number;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
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

export type AdminCategory = BackendCategory & {
  created_at?: string;
};

export type AdminComment = {
  id: number;
  article: number;
  article_slug: string;
  user: BackendUser;
  parent: number | null;
  content: string;
  created_at: string;
  is_approved: boolean;
  replies: AdminComment[];
};

export type AdminUser = Required<Pick<BackendUser, "id" | "full_name" | "email" | "role">> & {
  bio?: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
};

export type AdminMediaAsset = {
  id: number;
  title: string;
  file?: string;
  asset_type: "image" | "video";
  alt_text: string;
  optimized_url?: string;
  thumbnail_url?: string;
  created_at: string;
};

export type AdminOverview = {
  total_articles: number;
  total_views: number;
  today_views: number;
  total_comments: number;
  total_newsletter_subscribers: number;
  trending_articles: BackendArticle[];
  popular_categories: Array<{
    id: number;
    name: string;
    slug: string;
    articles_count: number;
    views_count: number | null;
  }>;
  recent_activity?: AdminActivityLog[];
  recent_login_attempts?: AdminLoginAttempt[];
  last_updated?: string;
  source?: "live_api";
};

export type AdminActivityLog = {
  id: number;
  user_name?: string;
  user_email?: string;
  action: string;
  object_type: string;
  object_id: string;
  description: string;
  metadata: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
};

export type AdminLoginAttempt = {
  id: number;
  email: string;
  user_name?: string;
  success: boolean;
  ip_address?: string | null;
  user_agent: string;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: number;
  email: string;
  source: string;
  is_active: boolean;
  created_at: string;
};

export type AdminArticleRevision = {
  id: number;
  created_by?: BackendUser;
  title: string;
  excerpt: string;
  content: string;
  editorial_status: "draft" | "review" | "published";
  is_featured: boolean;
  is_breaking: boolean;
  is_published: boolean;
  published_at: string | null;
  note: string;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const IS_PRODUCTION_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 1200);

function containsHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function sanitizeArticleHtml(value: string) {
  return value
    .replace(/<\s*(script|style|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<iframe\b[^>]*src=(["'])(.*?)\1[^>]*>[\s\S]*?<\/iframe>/gi, (match, _quote, src) => {
      return /^https:\/\/(www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/)/i.test(src) ? match : "";
    })
    .replace(/<iframe\b(?![^>]*src=)[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\s+srcdoc=(["']).*?\1/gi, "")
    .replace(/\s+style=(["']).*?\1/gi, "")
    .replace(/\s+style=\S+/gi, "")
    .replace(/\s+on\w+=(["']).*?\1/gi, "")
    .replace(/\s+on\w+=\S+/gi, "")
    .replace(/\s+(href|src)=(["'])\s*(javascript|data|vbscript|file):[\s\S]*?\2/gi, "")
    .replace(/<\s*\/?\s*(html|body|head|meta|link|base|form|input|button|textarea|select|svg|math)[^>]*>/gi, "");
}

function htmlToPlainParagraphs(value: string) {
  return value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|h4|blockquote|li)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/&nbsp;/g, " ").trim())
    .filter(Boolean);
}

const defaultCategoryImage = "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

const categoryImageFallback: Record<string, string> = {
  Politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  "Breaking News": "https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=1200&q=80",
  Economy: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  "Security News": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
  Crime: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&w=1200&q=80",
  Health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
  "National Assembly": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  Tech: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "World News": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80",
  "General News": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
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
      cache: "no-store",
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

async function adminApi<T>(
  path: string,
  token: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: Record<string, unknown> | FormData;
  } = {}
): Promise<ApiResponse<T> | null> {
  try {
    const isFormData = options.body instanceof FormData;
    const requestBody: BodyInit | undefined = options.body
      ? isFormData
        ? options.body as FormData
        : JSON.stringify(options.body)
      : undefined;
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
      },
      body: requestBody,
      cache: "no-store"
    });

    if (response.status === 204) {
      return {
        success: true,
        message: "Deleted successfully.",
        data: null as T
      };
    }

    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok && !payload.message && payload.data && typeof payload.data === "object") {
      return {
        ...payload,
        message: flattenApiErrors(payload.data)
      };
    }
    return payload;
  } catch {
    return null;
  }
}

function flattenApiErrors(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(flattenApiErrors).filter(Boolean).join(" ");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([field, error]) => `${field}: ${flattenApiErrors(error)}`)
      .filter(Boolean)
      .join(" ");
  }
  return "Request failed.";
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
  const contentHtml = article.content && containsHtml(article.content)
    ? sanitizeArticleHtml(article.content)
    : undefined;
  const body = article.content
    ? contentHtml
      ? htmlToPlainParagraphs(contentHtml)
      : article.content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : fallback?.body ?? [];

  return {
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category.name,
    author: article.author.full_name,
    authorSlug: slugify(article.author.full_name),
    authorBio: article.author.bio,
    authorImage: article.author.profile_image_url ?? null,
    authorRole: article.author.role,
    publishedAt: article.published_at ?? article.updated_at ?? article.created_at ?? new Date().toISOString(),
    updatedAt: article.updated_at,
    readTime: `${article.reading_time} min read`,
    image: article.featured_image_url ?? fallback?.image ?? categoryImageFallback[article.category.name] ?? defaultCategoryImage,
    featuredVideo: article.featured_video_url ?? null,
    featuredMediaType: article.featured_media_type ?? "image",
    viewsCount: article.views_count,
    tags: article.tags?.map((tag) => tag.name) ?? [],
    editorialStatus: article.editorial_status ?? (article.is_published ? "published" : "draft"),
    seoTitle: article.seo_title,
    seoDescription: article.seo_description,
    canonicalUrl: article.canonical_url,
    ogImage: article.og_image_url ?? null,
    featured: article.is_featured,
    breaking: article.is_breaking,
    published: article.is_published ?? true,
    trending: article.views_count >= 2500,
    contentHtml,
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
  const normalizedSlug = decodeURIComponent(slug).trim();
  const data = await fetchApi<BackendArticle>(`/articles/${encodeURIComponent(normalizedSlug)}/`);
  if (data) {
    return mapArticle(data);
  }
  return fallbackArticles.find((article) => article.slug === normalizedSlug) ?? null;
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

export async function logout(refresh: string, token: string) {
  return mutateApi<null>("/auth/logout/", { refresh }, token);
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

export async function exportNewsletterSubscribers(token: string) {
  try {
    const response = await fetch(`${API_URL}/analytics/newsletter/export/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      return null;
    }
    return response.blob();
  } catch {
    return null;
  }
}

export async function getNewsletterSubscribers(token: string) {
  return authApi<NewsletterSubscriber[]>("/analytics/newsletter/subscribers/?page_size=8", token);
}

export async function deactivateNewsletterSubscriber(token: string, subscriberId: number) {
  return adminApi<null>(`/analytics/newsletter/subscribers/${subscriberId}/`, token, {
    method: "DELETE"
  });
}

export async function getAdminArticles(token: string) {
  const response = await authApi<BackendArticle[]>("/articles/?page_size=50&ordering=-created_at", token);
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

export async function getAdminArticle(token: string, slug: string) {
  const response = await adminApi<BackendArticle>(`/articles/${slug}/`, token);
  if (!response?.success || !response.data) {
    return response
      ? { ...response, data: null as Article | null }
      : null;
  }
  return {
    ...response,
    data: mapArticle(response.data)
  };
}

export async function adminCreateArticle(token: string, payload: Record<string, unknown> | FormData) {
  return adminApi<BackendArticle>("/articles/", token, {
    method: "POST",
    body: payload
  });
}

export async function adminUpdateArticle(token: string, slug: string, payload: Record<string, unknown> | FormData) {
  return adminApi<BackendArticle>(`/articles/${slug}/`, token, {
    method: "PATCH",
    body: payload
  });
}

export async function getArticleRevisions(token: string, slug: string) {
  return adminApi<AdminArticleRevision[]>(`/articles/${slug}/revisions/`, token);
}

export async function restoreArticleRevision(token: string, slug: string, revisionId: number) {
  return adminApi<BackendArticle>(`/articles/${slug}/restore-revision/`, token, {
    method: "POST",
    body: { revision_id: revisionId }
  });
}

export async function adminDeleteArticle(token: string, article: Pick<Article, "id" | "slug">) {
  const response = await adminApi<null>(`/articles/${article.slug}/`, token, {
    method: "DELETE"
  });
  if (response?.success || !article.id) {
    return response;
  }
  return adminApi<null>(`/articles/${article.id}/delete-by-id/`, token, {
    method: "DELETE"
  });
}

export async function getAdminCategories(token: string) {
  return adminApi<AdminCategory[]>("/categories/?page_size=50", token);
}

export async function adminCreateCategory(token: string, payload: Record<string, unknown>) {
  return adminApi<AdminCategory>("/categories/", token, {
    method: "POST",
    body: payload
  });
}

export async function adminUpdateCategory(token: string, slug: string, payload: Record<string, unknown>) {
  return adminApi<AdminCategory>(`/categories/${slug}/`, token, {
    method: "PATCH",
    body: payload
  });
}

export async function adminDeleteCategory(token: string, slug: string) {
  return adminApi<null>(`/categories/${slug}/`, token, {
    method: "DELETE"
  });
}

export async function getAdminComments(token: string) {
  return adminApi<AdminComment[]>("/comments/?page_size=50&ordering=-created_at", token);
}

export async function adminDeleteComment(token: string, commentId: number) {
  return adminApi<null>(`/comments/${commentId}/`, token, {
    method: "DELETE"
  });
}

export async function getAdminUsers(token: string) {
  return adminApi<AdminUser[]>("/users/?page_size=50", token);
}

export async function adminCreateUser(token: string, payload: Record<string, unknown>) {
  return adminApi<AdminUser>("/users/", token, {
    method: "POST",
    body: payload
  });
}

export async function adminUpdateUser(token: string, userId: number, payload: Record<string, unknown>) {
  return adminApi<AdminUser>(`/users/${userId}/`, token, {
    method: "PATCH",
    body: payload
  });
}

export async function getAdminMedia(token: string) {
  return adminApi<AdminMediaAsset[]>("/media/?page_size=50", token);
}

export async function adminUploadMedia(token: string, payload: FormData) {
  return adminApi<AdminMediaAsset>("/media/", token, {
    method: "POST",
    body: payload
  });
}

export async function adminDeleteMedia(token: string, mediaId: number) {
  return adminApi<null>(`/media/${mediaId}/`, token, {
    method: "DELETE"
  });
}

export async function subscribeToNewsletter(email: string, source = "website", website = "") {
  return mutateApi<{ id: number; email: string }>("/newsletter/subscribe/", {
    email,
    source,
    website
  });
}
