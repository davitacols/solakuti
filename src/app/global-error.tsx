"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error("Solakuti global error", error);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong — Solakuti</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            min-height: 100vh;
            background: #0b0b0c;
            color: #f4f4f5;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 20px;
          }
          .wrap { width: 100%; max-width: 680px; }
          .eyebrow {
            display: inline-block;
            background: rgba(220, 38, 38, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            padding: 6px 14px;
            border-radius: 999px;
          }
          h1 {
            margin-top: 20px;
            font-size: clamp(32px, 7vw, 64px);
            font-weight: 900;
            line-height: 0.95;
            letter-spacing: -0.05em;
            color: #f4f4f5;
          }
          p {
            margin-top: 18px;
            max-width: 520px;
            color: rgba(244, 244, 245, 0.58);
            font-size: 16px;
            line-height: 1.7;
          }
          .actions { margin-top: 32px; display: flex; flex-wrap: wrap; gap: 12px; }
          button, a {
            display: inline-flex;
            align-items: center;
            height: 44px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            cursor: pointer;
            text-decoration: none;
            padding: 0 20px;
            transition: background 0.15s, color 0.15s;
            border: none;
          }
          .btn-primary { background: #dc2626; color: #fff; }
          .btn-primary:hover { background: #fff; color: #111; }
          .btn-ghost { background: transparent; color: rgba(244,244,245,0.6); border: 1px solid rgba(255,255,255,0.14); }
          .btn-ghost:hover { border-color: rgba(255,255,255,0.5); color: #f4f4f5; }
          .divider { margin-top: 40px; border: 0; border-top: 1px solid rgba(255,255,255,0.08); }
          .digest { margin-top: 16px; font-size: 11px; color: rgba(244,244,245,0.28); font-family: monospace; word-break: break-all; }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <span className="eyebrow">Critical error</span>
          <h1>Solakuti could not load this view.</h1>
          <p>
            An unexpected error occurred. Please try again — if the issue persists,
            refresh the page or return to the homepage.
          </p>
          <div className="actions">
            <button type="button" onClick={reset} className="btn-primary">
              Try again
            </button>
            <a href="/" className="btn-ghost">Go to homepage</a>
          </div>
          {error.digest && (
            <>
              <hr className="divider" />
              <p className="digest">Error ref: {error.digest}</p>
            </>
          )}
        </div>
      </body>
    </html>
  );
}
