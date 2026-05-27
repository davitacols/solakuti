"use client";

type AdSlotProps = {
  slot: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
};

export default function AdSlot({ slot, format = "horizontal", className = "" }: AdSlotProps) {
  const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ADS_ENABLED === "true";
  const isValidSlotId = /^\d+$/.test(slot);

  if (!adsEnabled || !isValidSlotId) {
    return null;
  }

  const height = format === "rectangle" ? "min-h-[250px]" : format === "vertical" ? "min-h-[600px]" : "min-h-[90px]";

  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-black/8 bg-black/[0.02] ${height} ${className}`} data-ad-slot={slot}>
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
