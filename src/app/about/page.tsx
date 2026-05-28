import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Globe, Newspaper, Rss, Zap } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Solakuti",
  description: "About Solakuti, a modern African digital newsroom covering Nigerian politics, public affairs, economy, security, culture and sport.",
  path: "/about"
});

const pillars = [
  {
    icon: Check,
    title: "Accuracy first",
    body: "Claims are sourced before publication. Errors are corrected on the record. Factual disputes go through the editorial desk with supporting evidence."
  },
  {
    icon: Globe,
    title: "Nigerian perspective",
    body: "Coverage built for readers living these stories — not international observers following from a distance. Context comes from the ground up."
  },
  {
    icon: Zap,
    title: "Speed with context",
    body: "Breaking news arrives with the background that makes it meaningful, not just the headline. Developing stories are updated as facts are confirmed."
  }
];

const coverageAreas = [
  "Politics", "Economy", "Security", "Crime", "Entertainment",
  "Health", "Tech", "Sports", "World News", "National Assembly",
  "Opinions", "General News", "Nigeria", "Breaking News"
];

const glance = [
  { label: "Coverage areas", value: "14 sections" },
  { label: "Publisher", value: "Solakuti Media" },
  { label: "Primary audience", value: "Nigeria & Africa" },
  { label: "Distribution", value: "Web, RSS, API" }
];

export default function AboutPage() {
  return (
    <main className="bg-[#f7f4ef] text-[#111]">
      <section className="border-b border-black/10 bg-[#111] text-white">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-300">
              <Newspaper className="size-4" aria-hidden="true" />
              About the newsroom
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-none tracking-[-0.06em] sm:text-7xl">
              Independent Nigerian reporting built for a faster news cycle.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
              Solakuti is a modern African digital newsroom covering Nigerian politics, public affairs, economy, security, culture and sport — with clarity, speed and editorial judgment.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/editorial-policy"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Editorial policy
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black uppercase tracking-[0.12em] text-white/80 transition hover:border-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Contact us
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">At a glance</p>
            <dl className="mt-4 divide-y divide-white/8">
              {glance.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs text-white/45">{label}</dt>
                  <dd className="text-sm font-black text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="container-page py-10 lg:py-12">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700">What drives us</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-black/8 bg-[#f7f4ef] p-6">
                <div className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-black tracking-[-0.03em]">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-black/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#f7f4ef]">
        <div className="container-page py-10 lg:py-12">
          <div className="md:flex md:items-end md:justify-between md:gap-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700">Coverage</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">What Solakuti covers.</h2>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-7 text-black/55 md:mt-0 md:text-right">
              Reporting across public affairs, politics, business, culture, security and sport — from Nigeria and beyond.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {coverageAreas.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black/70"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="container-page grid gap-5 py-10 md:grid-cols-2 lg:py-12">
          <div className="rounded-lg border border-black/8 bg-[#f7f4ef] p-6">
            <div className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-black tracking-[-0.04em]">Editorial independence</h2>
            <p className="mt-2 text-sm leading-7 text-black/60">
              Newsroom decisions — what to publish, how to frame it, which sources to trust — are made by editors, not advertisers. Commercial and editorial operations are kept separate. Sponsored content is always clearly labelled.
            </p>
            <Link
              href="/editorial-policy"
              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-red-700 transition hover:text-black"
            >
              Read the editorial policy <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-lg border border-black/8 bg-[#f7f4ef] p-6">
            <div className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700">
              <Rss className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-black tracking-[-0.04em]">Built for platforms</h2>
            <p className="mt-2 text-sm leading-7 text-black/60">
              Solakuti publishes a full RSS feed, a Google News sitemap, structured article data, Open Graph previews and clean canonical URLs — built for discovery platforms, aggregators and syndication partners.
            </p>
            <a
              href="/rss.xml"
              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-red-700 transition hover:text-black"
            >
              Subscribe via RSS <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="rounded-lg border border-black/10 bg-[#111] p-6 text-white md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Get in touch</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Send a tip, correction or partnership enquiry.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">
              The editorial desk, corrections team, partnerships and advertising contacts are all reachable from the contact page.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-5 inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-red-600 hover:text-white md:mt-0"
          >
            Contact
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
