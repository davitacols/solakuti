import { AlertTriangle } from "lucide-react";

export default function SiteNotice() {
  return (
    <section className="border-b border-amber-200 bg-amber-50 text-[#241406] dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-50">
      <div className="container-page flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-amber-500 text-white shadow-sm">
            <AlertTriangle className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-black">Service notice</p>
            <p className="mt-0.5 max-w-4xl font-semibold leading-relaxed text-black/68 dark:text-white/72">
              We are currently experiencing intermittent downtime while we fix a persistent publishing and article
              availability issue. Some stories may be temporarily unavailable or slow to load.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-amber-300 bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-800 dark:border-amber-400/30 dark:bg-white/10 dark:text-amber-100">
          Maintenance
        </span>
      </div>
    </section>
  );
}
