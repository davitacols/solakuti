"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error("Solakuti global error", error);

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: "48px 20px", fontFamily: "Inter, Arial, sans-serif" }}>
          <section style={{ maxWidth: 840, margin: "0 auto" }}>
            <p style={{ color: "#fca5a5", fontSize: 12, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Critical error
            </p>
            <h1 style={{ marginTop: 20, fontSize: "clamp(42px, 9vw, 86px)", lineHeight: 0.92, letterSpacing: "-0.06em" }}>
              Solakuti could not load this view.
            </h1>
            <p style={{ marginTop: 20, maxWidth: 620, color: "rgba(255,255,255,0.68)", fontSize: 18, lineHeight: 1.7 }}>
              Please try again. If the issue persists, refresh the page or return to the homepage.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 28,
                height: 48,
                borderRadius: 999,
                border: 0,
                background: "#dc2626",
                color: "#fff",
                padding: "0 22px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
