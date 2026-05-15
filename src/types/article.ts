export type ArticleCategory =
  | "Politics"
  | "Breaking News"
  | "Economy"
  | "Security News"
  | "World News"
  | "General News"
  | "Entertainment"
  | "Opinions"
  | "Nigeria";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
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
