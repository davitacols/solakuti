import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { categories, categoryToSlug } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#111] text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center">
            <span className="relative h-16 w-56 overflow-hidden">
              <Image
                src="/solakuti-logo-transparent.png"
                alt="Solakuti"
                fill
                sizes="224px"
                className="object-contain object-left"
              />
            </span>
          </Link>
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
              <Link key={category} href={`/category/${categoryToSlug(category)}`} className="text-sm font-bold text-white/70 transition hover:text-white">
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/42">More</h3>
          <div className="mt-4 grid gap-3">
            {categories.slice(4).map((category) => (
              <Link key={category} href={`/category/${categoryToSlug(category)}`} className="text-sm font-bold text-white/70 transition hover:text-white">
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/42">Newsletter</h3>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Get Solakuti's morning edit and weekend culture brief.
          </p>
          <div className="mt-4 flex rounded-md bg-white p-1">
            <input
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 px-3 text-sm font-semibold text-black outline-none"
            />
            <LoadingButton type="button" className="rounded bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em]">
              Join
            </LoadingButton>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col justify-between gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/38 sm:flex-row">
          <span>© 2026 Solakuti Media</span>
          <span>Built for the next Nigerian news cycle</span>
        </div>
      </div>
    </footer>
  );
}
