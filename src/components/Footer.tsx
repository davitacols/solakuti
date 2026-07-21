import Image from "next/image";
import { Copyright, Facebook, Rss, Twitter } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import NewsletterSignupForm from "@/components/NewsletterSignupForm";
import PwaInstallCard from "@/components/PwaInstallCard";
import { categories, categoryToSlug } from "@/lib/utils";

export default function Footer() {
  const socials = [
    { icon: Facebook, label: "Facebook: @solakutisblog", href: "https://www.facebook.com/solakutisblog" },
    { icon: Twitter, label: "X: @solakutidotcom", href: "https://x.com/solakutidotcom" }
  ];

  const sections = categories.slice(0, 6);
  const moreLinks = [
    { label: "About", href: "/about" },
    { label: "Live Scores", href: "/livescores" },
    { label: "Contact", href: "/contact" },
    { label: "Write for Us", href: "/write-for-us" },
    { label: "Editorial Policy", href: "/editorial-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Use", href: "/terms-of-use" },
    { label: "Advertise", href: "/advertise" }
  ];

  return (
    <footer className="mt-12 bg-[#0a0a0a] text-white">
      {/* Top strip */}
      <div className="border-b border-white/8">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">New</span>
            <span className="text-sm font-medium text-white/60">Live scores, match centres and league tables now available</span>
          </div>
          <LoadingLink href="/livescores" className="rounded-full border border-white/12 px-4 py-2 text-xs font-black text-white/70 transition hover:border-white hover:text-white">
            Explore →
          </LoadingLink>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-page grid gap-10 py-10 sm:py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1fr]">
        {/* Brand */}
        <div>
          <LoadingLink href="/" className="inline-flex items-center overflow-hidden rounded-md">
            <span className="relative h-14 w-48 overflow-hidden sm:h-16 sm:w-56">
              <Image
                src="/solakuti-logo-transparent.png"
                alt="Solakuti"
                fill
                sizes="224px"
                className="object-contain object-left"
              />
            </span>
          </LoadingLink>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/50">
            A modern African digital newsroom covering the stories shaping Nigeria — politics, economy, security, culture and sport.
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
            <a
              href="/rss.xml"
              className="grid size-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
              aria-label="RSS Feed"
            >
              <Rss className="size-4" />
            </a>
          </div>
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Sections</h3>
          <div className="mt-4 grid gap-2.5">
            {sections.map((category) => (
              <LoadingLink key={category} href={`/category/${categoryToSlug(category)}`} className="text-sm font-medium text-white/60 transition hover:text-white">
                {category}
              </LoadingLink>
            ))}
          </div>
        </div>

        {/* More */}
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Company</h3>
          <div className="mt-4 grid gap-2.5">
            {moreLinks.map((item) => (
              <LoadingLink key={item.href} href={item.href} className="text-sm font-medium text-white/60 transition hover:text-white">
                {item.label}
              </LoadingLink>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Stay informed</h3>
          <p className="mt-4 text-sm leading-6 text-white/50">
            Get Solakuti&apos;s morning edit and weekend culture brief delivered to your inbox.
          </p>
          <div className="mt-4">
            <NewsletterSignupForm source="footer-newsletter" compact />
          </div>
          <PwaInstallCard />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 py-5">
        <div className="container-page flex flex-col justify-between gap-3 text-[11px] font-medium text-white/30 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2">
            <Copyright className="size-3.5" aria-hidden="true" />
            2026 Solakuti Media. All rights reserved.
          </span>
          <span>Built for the next Nigerian news cycle</span>
        </div>
      </div>
    </footer>
  );
}
