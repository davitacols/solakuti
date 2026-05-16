import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/api";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

type OpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#111111",
          color: "white",
          padding: "64px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.04em" }}>Solakuti</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>
            {article?.category ?? "News"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.055em" }}>
            {article?.seoTitle || article?.title || "Solakuti News"}
          </div>
          <div style={{ marginTop: 30, fontSize: 28, lineHeight: 1.3, color: "rgba(255,255,255,0.68)" }}>
            {article?.excerpt || "Premium Nigerian news, analysis and public-interest reporting."}
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.55)" }}>
          solakuti.com
        </div>
      </div>
    ),
    size
  );
}
