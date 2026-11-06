"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "solakuti-cookie-consent";
const CONSENT_EVENT = "solakuti-cookie-consent-change";

const nativeBannerDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;color-scheme:light}</style>
  </head>
  <body>
    <script async="async" data-cfasync="false" src="https://pl29362420.profitableratecpmnetwork.com/35b333388d00dc3b39b1cd002d5efe2f/invoke.js"><\/script>
    <div id="container-35b333388d00dc3b39b1cd002d5efe2f"></div>
  </body>
</html>`;

const rectangleBannerDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>html,body{width:300px;height:250px;margin:0;padding:0;overflow:hidden;background:transparent;color-scheme:light}</style>
  </head>
  <body>
    <script>
      window.atOptions = {
        key: "6a08842c375b43ff940904e9cbcf4f55",
        format: "iframe",
        height: 250,
        width: 300,
        params: {}
      };
    <\/script>
    <script src="https://www.highrevenueformat.com/6a08842c375b43ff940904e9cbcf4f55/invoke.js"><\/script>
  </body>
</html>`;

type AdsterraAdProps = {
  format: "native" | "rectangle";
  className?: string;
  desktopOnly?: boolean;
};

export default function AdsterraAd({ format, className = "", desktopOnly = false }: AdsterraAdProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [viewportEligible, setViewportEligible] = useState(!desktopOnly);

  useEffect(() => {
    const syncConsent = () => setHasConsent(localStorage.getItem(CONSENT_KEY) === "accepted");

    syncConsent();
    window.addEventListener(CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(CONSENT_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!desktopOnly) {
      setViewportEligible(true);
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setViewportEligible(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, [desktopOnly]);

  if (!hasConsent || !viewportEligible) return null;

  const isNative = format === "native";

  return (
    <aside aria-label="Advertisement" className={className}>
      <p className="mb-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-black/30">
        Advertisement
      </p>
      <div
        className={
          isNative
            ? "mx-auto h-[320px] w-full overflow-hidden rounded-lg border border-black/8 bg-white"
            : "mx-auto h-[250px] w-[300px] max-w-full overflow-hidden bg-white"
        }
      >
        <iframe
          title={isNative ? "Sponsored stories" : "Advertisement"}
          srcDoc={isNative ? nativeBannerDocument : rectangleBannerDocument}
          width={isNative ? "100%" : 300}
          height={isNative ? 320 : 250}
          scrolling="no"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          className="block size-full border-0"
        />
      </div>
    </aside>
  );
}
