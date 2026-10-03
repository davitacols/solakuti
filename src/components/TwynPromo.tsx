import { ArrowUpRight, Check, Network, Sparkles } from "lucide-react";

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
    <section className="container-page py-8" aria-label="Sponsored promotion from Twyn">
      <div className="relative overflow-hidden rounded-2xl border border-[#f3a36b]/25 bg-[#171310] text-white shadow-[0_24px_80px_rgba(18,18,18,0.18)]">
        <div className="pointer-events-none absolute -left-32 -top-44 size-[32rem] rounded-full bg-[#d86f45]/16 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 right-0 size-[34rem] rounded-full bg-[#725eb7]/18 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center lg:p-10 xl:p-12">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/48">
                Sponsored partner
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f2bd70]">
                <Sparkles className="size-3.5" />
                Built for people who build
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#d86f45] text-white shadow-[4px_4px_0_rgba(243,163,107,0.28)]">
                <Network className="size-5" />
              </span>
              <span className="text-2xl font-black tracking-[-0.05em]">Twyn</span>
            </div>

            <h2 className="mt-6 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl">
              Stop building alone.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/62 sm:text-lg">
              Twyn matches you with collaborators who fit what you&apos;re building, explains why—and gives you a shared space to turn a match into real work.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/58 sm:text-sm">
              {['AI-matched collaborators', 'The fit, explained', 'Free to start'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid size-4 place-items-center rounded-full bg-[#f3a36b]/15 text-[#f3a36b]">
                    <Check className="size-3" />
                  </span>
                  {item}
                </span>
              ))}
            </div>

            <a
              href={TWYN_SIGNUP_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f3a36b] px-6 text-sm font-black text-[#171310] shadow-[5px_5px_0_rgba(216,111,69,0.32)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-white hover:shadow-[3px_3px_0_rgba(216,111,69,0.32)]"
            >
              Find your collaborator
              <ArrowUpRight className="size-4" />
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <span className="absolute -right-2 -top-3 z-10 rotate-3 rounded-lg bg-[#f2bd70] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#171310] shadow-[3px_3px_0_rgba(255,255,255,0.12)]">
              94% fit
            </span>
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f3a36b]">Why this match works</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-[#d86f45] text-sm font-black">YO</span>
                <span className="h-px flex-1 bg-gradient-to-r from-[#d86f45] via-[#f2bd70] to-[#725eb7]" />
                <span className="grid size-12 place-items-center rounded-xl bg-[#725eb7] text-sm font-black">AO</span>
              </div>
              <p className="mt-5 text-lg font-black leading-snug tracking-[-0.025em]">
                You need a design-led co-builder. Ada ships polished React and wants this exact kind of project.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                  <p className="text-white/38">Role complement</p>
                  <p className="mt-1 font-bold text-white/82">Engineer × designer</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                  <p className="text-white/38">Weekly overlap</p>
                  <p className="mt-1 font-bold text-white/82">8 shared hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
