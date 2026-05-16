import { getLatestArticles } from "@/lib/api";
import { escapeXml, SITE_URL, xmlResponse } from "@/lib/feed";

export async function GET() {
  const articles = await getLatestArticles();
  const recentArticles = articles.slice(0, 100);
  const urls = recentArticles
    .map((article) => {
      const keywords = [article.category, ...(article.tags ?? [])].filter(Boolean).join(", ");
      return `
        <url>
          <loc>${escapeXml(`${SITE_URL}/article/${article.slug}`)}</loc>
          <news:news>
            <news:publication>
              <news:name>Solakuti</news:name>
              <news:language>en</news:language>
            </news:publication>
            <news:publication_date>${new Date(article.publishedAt).toISOString()}</news:publication_date>
            <news:title>${escapeXml(article.title)}</news:title>
            ${keywords ? `<news:keywords>${escapeXml(keywords)}</news:keywords>` : ""}
          </news:news>
          <image:image>
            <image:loc>${escapeXml(article.image)}</image:loc>
            <image:title>${escapeXml(article.title)}</image:title>
          </image:image>
        </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    >
      ${urls}
    </urlset>`;

  return xmlResponse(xml, "application/xml; charset=utf-8");
}
