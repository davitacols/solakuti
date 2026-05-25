import { Article } from "@/types/article";
import { SITE_URL, absoluteUrl, truncateDescription } from "@/lib/seo";

export { SITE_URL };

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRssFeed({
  title,
  description,
  link,
  articles
}: {
  title: string;
  description: string;
  link: string;
  articles: Article[];
}) {
  const items = articles
    .slice(0, 50)
    .map((article) => {
      const url = `${SITE_URL}/article/${article.slug}`;
      const image = absoluteUrl(article.ogImage || article.image);
      return `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <description>${escapeXml(truncateDescription(article.seoDescription || article.excerpt))}</description>
          <category>${escapeXml(article.category)}</category>
          <author>${escapeXml(article.author)}</author>
          <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
          <media:content url="${escapeXml(image)}" medium="image" />
          <enclosure url="${escapeXml(image)}" type="image/jpeg" />
        </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>${escapeXml(title)}</title>
        <link>${escapeXml(link)}</link>
        <description>${escapeXml(description)}</description>
        <language>en-ng</language>
        <copyright>Copyright ${new Date().getFullYear()} Solakuti Media</copyright>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <ttl>10</ttl>
        ${items}
      </channel>
    </rss>`;
}

export function xmlResponse(xml: string, contentType = "application/rss+xml; charset=utf-8") {
  return new Response(xml, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, s-maxage=600"
    }
  });
}
