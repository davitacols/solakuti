import { ArrowUpRight, Network, Sparkles } from "lucide-react";

const TWYN_SIGNUP_URL =
  "https://www.twynd.de/auth/signup?utm_source=solakuti&utm_medium=partner&utm_campaign=find_your_collaborator";

type TwynPromoProps = {
  compact?: boolean;
};

export default function TwynPromo({ compact = false }: TwynPromoProps) {
  if (compact) {
    return (
      <aside
        aria-label="Sponsored promotion from Twyn"
        className="relative overflow-hidden rounded-xl border border-[#f3a36b]/25 bg-[#171310] p-5 text-white shadow-sm"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-[#d86f45]/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white/42">Sponsored</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-[#f2bd70]">
              <Sparkles className="size-3" />
              Free to start
            </span>
          </div>
          <div className="mt-5 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#d86f45] text-white">
              <Network className="size-4.5" />
            </span>
            <span className="text-xl font-black tracking-[-0.04em]">Twyn</span>
          </div>
          <p className="mt-4 text-xl font-black leading-[1.05] tracking-[-0.04em]">
            Find the right person to build with.
          </p>
          <p className="mt-2 text-xs leading-5 text-white/55">
            Get matched with compatible collaborators—and see exactly why the fit works.
          </p>
          <a
            href={TWYN_SIGNUP_URL}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#f3a36b] px-4 text-xs font-black text-[#171310] transition hover:bg-white"
          >
            Find your collaborator
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </aside>
    );
  }

  return (
    <section className="container-page py-5" aria-label="Sponsored promotion from Twyn">
      <div className="relative overflow-hidden rounded-xl border border-[#f3a36b]/25 bg-[#171310] text-white shadow-[0_12px_40px_rgba(18,18,18,0.14)]">
        <div className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#d86f45]/18 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-12 size-64 rounded-full bg-[#725eb7]/14 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#d86f45] text-white shadow-[3px_3px_0_rgba(243,163,107,0.24)]">
              <Network className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white/42">Sponsored</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#f2bd70]">
                  <Sparkles className="size-3" />
                  Twyn · Free to start
                </span>
              </div>
              <h2 className="mt-1.5 text-2xl font-black leading-tight tracking-[-0.045em] sm:text-3xl">
                Find the right person to build with.
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-white/56">
                AI-matched collaborators, the fit explained, and a shared space to start building.
              </p>
            </div>
          </div>

          <a
            href={TWYN_SIGNUP_URL}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f3a36b] px-5 text-sm font-black text-[#171310] transition hover:bg-white"
          >
            Explore Twyn
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
