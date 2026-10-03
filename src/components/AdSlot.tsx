"use client";

import { useEffect, useRef } from "react";

const CONSENT_KEY = "solakuti-cookie-consent";
const CONSENT_EVENT = "solakuti-cookie-consent-change";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSlotProps = {
  slot: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
};

export default function AdSlot({ slot, format = "horizontal", className = "" }: AdSlotProps) {
  const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ADS_ENABLED === "true";
  const isValidSlotId = /^\d+$/.test(slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsEnabled || !isValidSlotId) return;

    const initializeAd = () => {
      if (pushed.current || localStorage.getItem(CONSENT_KEY) !== "accepted") return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // The next consent event or mount will retry if the script is unavailable.
      }
    };

    initializeAd();
    window.addEventListener(CONSENT_EVENT, initializeAd);

    return () => window.removeEventListener(CONSENT_EVENT, initializeAd);
  }, [adsEnabled, isValidSlotId]);

  if (!adsEnabled || !isValidSlotId) return null;

  const height =
    format === "rectangle" ? "min-h-[250px]" : format === "vertical" ? "min-h-[600px]" : "min-h-[90px]";

  return (
    <div className={`overflow-hidden ${height} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5089730714682068"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
