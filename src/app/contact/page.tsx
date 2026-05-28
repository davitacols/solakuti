import type { Metadata } from "next";
import { ArrowRight, BadgeHelp, Facebook, Mail, Megaphone, ShieldAlert, Twitter } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Solakuti",
  description: "Contact Solakuti for news tips, corrections, partnerships, syndication and advertising.",
  path: "/contact"
});

const contactRoutes = [
  {
    icon: Megaphone,
    title: "News Tips",
    email: "editorial@solakuti.com",
    href: "mailto:editorial@solakuti.com?subject=News%20tip%20for%20Solakuti",
    body: "Send documents, eyewitness details, dates, names, locations and any supporting context that can help the newsroom verify the story.",
    label: "Send a tip"
  },
  {
    icon: ShieldAlert,
    title: "Corrections",
    email: "editorial@solakuti.com",
    href: "mailto:editorial@solakuti.com?subject=Correction%20request",
    body: "Include the article link, the exact line or claim in dispute and verifiable evidence. Correction requests are reviewed by the editorial desk.",
    label: "Request correction"
  },
  {
    icon: BadgeHelp,
    title: "Partnerships",
    email: "partnerships@solakuti.com",
    href: "mailto:partnerships@solakuti.com?subject=Partnership%20enquiry",
    body: "For publisher distribution, RSS integrations, content partnerships, platform onboarding and syndication conversations.",
    label: "Start conversation"
  },
  {
    icon: Mail,
    title: "Advertising",
    email: "ads@solakuti.com",
    href: "mailto:ads@solakuti.com?subject=Advertising%20enquiry",
    body: "For sponsorships, brand campaigns and commercial enquiries. Sponsored placements must be clearly labelled to readers.",
    label: "Contact ads desk"
  }
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", handle: "@solakutisblog", href: "https://www.facebook.com/solakutisblog" },
  { icon: Twitter, label: "X", handle: "@solakutidotcom", href: "https://x.com/solakutidotcom" }
];

export default function ContactPage() {
  return (
    <main className="bg-[#f7f4ef] text-[#111]">
      <section className="border-b border-black/10 bg-[#111] text-white">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-300">
              <Mail className="size-4" aria-hidden="true" />
              Contact
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-none tracking-[-0.06em] sm:text-7xl">
              Reach the Solakuti newsroom.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
              Send news tips, corrections, partnership requests, advertising enquiries and distribution questions to the right desk.
            </p>
            <a
              href="mailto:editorial@solakuti.com"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <Mail className="size-4" aria-hidden="true" />
              Email editorial
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Before you send</p>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-white/64">
              <p>Use a clear subject line so the right editor can route your message quickly.</p>
              <p>For sensitive tips, include only the information you are comfortable sharing by email.</p>
              <p>For corrections, include the article URL and supporting evidence.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-page py-10 lg:py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {contactRoutes.map(({ icon: Icon, title, email, href, body, label }) => (
            <article key={title} className="rounded-lg border border-black/10 bg-white p-6 editorial-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-11 place-items-center rounded-full bg-red-50 text-red-700">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black/45">
                  {title}
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/62">{body}</p>
              <a
                href={href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                {label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <p className="mt-3 break-all text-xs font-bold text-black/42">{email}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Social channels</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Follow verified Solakuti handles.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
              Use these official accounts for updates and public messages. Editorial tips and correction requests should still go through email.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {socialLinks.map(({ icon: Icon, label, handle, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-[#f7f4ef] p-5 transition hover:border-red-300 hover:bg-red-50"
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-black text-white">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.15em] text-black/40">{label}</span>
                    <span className="mt-1 block text-sm font-black text-black">{handle}</span>
                  </span>
                </span>
                <ArrowRight className="size-4 text-black/40" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="rounded-lg border border-black/10 bg-[#111] p-6 text-white md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Useful links</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Need policy or advertising details?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">
              Review our editorial policy, advertising page, privacy policy and terms before sending commercial or rights-related requests.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
            <LoadingLink href="/editorial-policy" className="rounded-full border border-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/70 transition hover:border-white hover:text-white">
              Editorial policy
            </LoadingLink>
            <LoadingLink href="/advertise" className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-red-600 hover:text-white">
              Advertise
            </LoadingLink>
          </div>
        </div>
      </section>
    </main>
  );
}
