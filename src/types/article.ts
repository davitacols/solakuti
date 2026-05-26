export type ArticleCategory = string;

export type ArticleSportsLink = {
  id: string;
  targetType: "competition" | "team" | "fixture";
  targetId: string;
  targetSlug?: string;
  targetName?: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  author: string;
  authorSlug?: string;
  authorBio?: string;
  authorImage?: string | null;
  authorRole?: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  image: string;
  featuredVideo?: string | null;
  featuredMediaType?: "image" | "video";
  viewsCount?: number;
  tags?: string[];
  sportsLinks?: ArticleSportsLink[];
  editorialStatus?: "draft" | "review" | "published";
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string | null;
  featured?: boolean;
  breaking?: boolean;
  published?: boolean;
  trending?: boolean;
  contentHtml?: string;
  body: string[];
};

export type Category = {
  id: string;
  name: ArticleCategory;
  slug: string;
  description: string;
  featuredImage?: string | null;
  articlesCount?: number;
};

export type Comment = {
  id: string;
  article: string;
  user: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
  replies: Comment[];
};
