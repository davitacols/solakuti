import { getLatestArticles } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getLatestArticles();
  const items = articles
    .slice(0, 30)
    .map((article) => {
      const url = `${SITE_URL}/article/${article.slug}`;
      return `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <description>${escapeXml(article.excerpt)}</description>
          <category>${escapeXml(article.category)}</category>
          <author>${escapeXml(article.author)}</author>
          <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
          <enclosure url="${escapeXml(article.image)}" type="image/jpeg" />
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Solakuti</title>
        <link>${SITE_URL}</link>
        <description>Premium Nigerian news, analysis and culture from Solakuti.</description>
        <language>en-ng</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600"
    }
  });
}
