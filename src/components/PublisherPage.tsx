import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";

type PublisherPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  cta?: {
    label: string;
    href: string;
  };
};

export default function PublisherPage({ eyebrow, title, intro, sections, cta }: PublisherPageProps) {
  return (
    <main className="bg-[#f7f4ef]">
      <section className="border-b border-black/10 bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-300">
            <ShieldCheck className="size-4" />
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-none tracking-[-0.07em] sm:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">{intro}</p>
          {cta && (
            <Link
              href={cta.href}
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
            >
              <Mail className="size-4" />
              {cta.label}
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </section>

      <section className="container-page grid gap-5 py-10 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-black/10 bg-white p-6 editorial-shadow">
            <h2 className="text-2xl font-black tracking-[-0.05em] text-[#111]">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-black/62">{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
