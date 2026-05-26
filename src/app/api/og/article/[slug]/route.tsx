import { ImageResponse } from "next/og";
import { ApiUnavailableError, getArticleBySlug } from "@/lib/api";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const runtime = "edge";
const size = {
  width: 1200,
  height: 630
};

const fallbackImage = "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

type OgArticleProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: OgArticleProps) {
  const { slug } = await params;
  let article: Awaited<ReturnType<typeof getArticleBySlug>> = null;
  try {
    article = slug === "solakuti" ? null : await getArticleBySlug(slug);
  } catch (error) {
    if (!(error instanceof ApiUnavailableError)) {
      throw error;
    }
  }
  const title = article?.seoTitle || article?.title || "Solakuti";
  const category = article?.category || "Premium Nigerian News";
  const image = absoluteUrl(article?.ogImage || article?.image, fallbackImage);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#111"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          width={1200}
          height={630}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            inset: 0
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.58) 52%, rgba(0,0,0,0.12) 100%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 56,
            display: "flex",
            flexDirection: "column",
            gap: 26
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              color: "white",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.03em"
            }}
          >
            <span
              style={{
                display: "flex",
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#dc2626"
              }}
            />
            Solakuti
          </div>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              borderRadius: 999,
              background: "#dc2626",
              color: "white",
              padding: "12px 20px",
              fontSize: 22,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.12em"
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 860,
              color: "white",
              fontSize: title.length > 82 ? 58 : 68,
              lineHeight: 0.96,
              fontWeight: 900,
              letterSpacing: "-0.06em"
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.72)",
              fontSize: 24,
              fontWeight: 800
            }}
          >
            solakuti.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
