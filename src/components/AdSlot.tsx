"use client";

import { useEffect, useRef } from "react";

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
    if (!adsEnabled || !isValidSlotId || pushed.current) return;
    const consent = localStorage.getItem("solakuti-cookie-consent");
    if (consent !== "accepted") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle script not yet ready
    }
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
