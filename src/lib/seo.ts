import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com").replace(/\/$/, "");
export const SITE_NAME = "Solakuti";
export const SITE_TITLE = "Solakuti | Premium Nigerian News and Media";
export const SITE_DESCRIPTION =
  "Solakuti is a modern Nigerian digital newsroom covering politics, economy, security, entertainment, sports, technology, opinions and breaking news.";
export const SITE_LOCALE = "en_NG";
export const SITE_LANGUAGE = "en-NG";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og/article/solakuti`;
export const LOGO_URL = `${SITE_URL}/solakuti-logo-transparent.png`;

export function absoluteUrl(value?: string | null, fallback = DEFAULT_OG_IMAGE) {
  if (!value) {
    return fallback;
  }

  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return fallback;
  }
}

export function canonicalPath(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function stripHtml(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateDescription(value: string, fallback = SITE_DESCRIPTION) {
  const clean = stripHtml(value) || fallback;
  return clean.length > 160 ? `${clean.slice(0, 157).trim()}...` : clean;
}

type BuildMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image,
  imageAlt = SITE_NAME,
  type = "website",
  noIndex = false
}: BuildMetadataOptions): Metadata {
  const canonical = canonicalPath(path);
  const imageUrl = absoluteUrl(image);
  const metaDescription = truncateDescription(description);

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type,
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [imageUrl]
    },
    robots: noIndex
      ? {
          index: false,
          follow: false
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        }
  };
}

export const newsOrganizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 512,
    height: 512
  },
  sameAs: [
    "https://x.com/solakuti",
    "https://www.facebook.com/solakuti"
  ],
  areaServed: {
    "@type": "Country",
    name: "Nigeria"
  },
  publishingPrinciples: `${SITE_URL}/editorial-policy`
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
