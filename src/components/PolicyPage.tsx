import { ShieldCheck } from "lucide-react";

type PolicySection = {
  title: string;
  body: React.ReactNode;
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: PolicySection[];
  contactEmail: string;
  contactNote: string;
};

export default function PolicyPage({ eyebrow, title, intro, lastUpdated, sections, contactEmail, contactNote }: PolicyPageProps) {
  return (
    <main className="bg-[#f7f4ef]">
      <section className="border-b border-black/10 bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-300">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-none tracking-[-0.07em] sm:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">{intro}</p>
          <p className="mt-5 inline-flex items-center rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/40">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <div className="mx-auto max-w-3xl divide-y divide-black/8 overflow-hidden rounded-xl border border-black/10 bg-white">
          {sections.map((section, i) => (
            <div key={section.title} className="p-6 lg:p-8">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-black text-red-700">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-black tracking-[-0.02em] text-[#111]">{section.title}</h2>
                  <div className="mt-2 text-sm leading-7 text-black/62">{section.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-black/10 bg-[#111] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">Questions about this policy</p>
              <p className="mt-1 text-base font-black tracking-[-0.02em]">{contactNote}</p>
            </div>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-4 inline-flex h-10 shrink-0 items-center rounded-full bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-red-600 hover:text-white sm:mt-0"
            >
              {contactEmail}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
