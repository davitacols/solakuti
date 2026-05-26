import { getLatestArticles } from "@/lib/api";
import { buildRssFeed, SITE_URL, xmlResponse } from "@/lib/feed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const articles = await getLatestArticles();
  return xmlResponse(
    buildRssFeed({
      title: "Solakuti",
      description: "Premium Nigerian news, analysis and culture from Solakuti.",
      link: SITE_URL,
      articles
    })
  );
}
