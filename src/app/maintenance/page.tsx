import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Scheduled maintenance — Solakuti",
  description: "Solakuti is briefly offline for scheduled maintenance and will be back shortly.",
  robots: { index: false, follow: false }
};

// Fully self-contained: renders no data from the API, so it stays up even
// while the backend is being migrated.
export default function MaintenancePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0c] px-5 py-16 text-white">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-8 h-12 w-40 relative">
          <Image
            src="/solakuti-logo-transparent.png"
            alt="Solakuti"
            fill
            priority
            sizes="160px"
            className="object-contain"
          />
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-600/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-400">
          <Wrench className="size-3.5" aria-hidden="true" />
          Scheduled maintenance
        </span>

        <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-5xl">
          We&apos;ll be back shortly.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/60">
          Solakuti is briefly offline while we move to faster infrastructure. The newsroom will be
          back online in a few hours — thank you for your patience.
        </p>

        <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-white/45">
          <Clock className="size-3.5" aria-hidden="true" />
          Expected back: a few hours
        </div>

        <div className="mt-10 border-t border-white/8 pt-6 text-sm text-white/40">
          For urgent editorial matters, email{" "}
          <a href="mailto:editorial@solakuti.com" className="font-bold text-white/70 underline underline-offset-2">
            editorial@solakuti.com
          </a>
        </div>
      </div>
    </main>
  );
}
