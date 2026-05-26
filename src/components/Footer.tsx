import Image from "next/image";
import { Copyright, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import NewsletterSignupForm from "@/components/NewsletterSignupForm";
import { categories, categoryToSlug } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#111] text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <LoadingLink href="/" className="inline-flex items-center overflow-hidden rounded-md">
            <span className="relative h-16 w-56 overflow-hidden">
              <Image
                src="/solakuti-logo-transparent.png"
                alt="Solakuti"
                fill
                sizes="224px"
                className="object-contain object-left"
              />
            </span>
          </LoadingLink>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
            A premium modern African digital newsroom covering the stories shaping Nigeria.
          </p>
          <div className="mt-6 flex gap-2">
            {[Twitter, Instagram, Facebook, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="grid size-10 place-items-center rounded-full border border-white/12 text-white/70 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                aria-label="Social link"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/42">Sections</h3>
          <div className="mt-4 grid gap-3">
            {categories.slice(0, 4).map((category) => (
              <LoadingLink key={category} href={`/category/${categoryToSlug(category)}`} className="rounded py-1 text-sm font-bold text-white/70 transition hover:text-white">
                {category}
              </LoadingLink>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/42">More</h3>
          <div className="mt-4 grid gap-3">
            {[
              { label: "About", href: "/about" },
              { label: "Live Scores", href: "/livescores" },
              { label: "Contact", href: "/contact" },
              { label: "Editorial Policy", href: "/editorial-policy" },
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Use", href: "/terms-of-use" },
              { label: "Advertise", href: "/advertise" }
            ].map((item) => (
              <LoadingLink key={item.href} href={item.href} className="rounded py-1 text-sm font-bold text-white/70 transition hover:text-white">
                {item.label}
              </LoadingLink>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/42">Newsletter</h3>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Get Solakuti's morning edit and weekend culture brief.
          </p>
          <div className="mt-4">
            <NewsletterSignupForm source="footer-newsletter" compact />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col justify-between gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/38 sm:flex-row">
          <span className="inline-flex items-center gap-2">
            <Copyright className="size-3.5" aria-hidden="true" />
            2026 Solakuti Media
          </span>
          <span>Built for the next Nigerian news cycle</span>
        </div>
      </div>
    </footer>
  );
}
