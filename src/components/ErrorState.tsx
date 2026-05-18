import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";

type ErrorStateProps = {
  eyebrow: string;
  title: string;
  message: string;
  reset?: () => void;
};

export default function ErrorState({ eyebrow, title, message, reset }: ErrorStateProps) {
  return (
    <main className="min-h-[70vh] bg-[#f7f4ef]">
      <section className="border-b border-black/10 bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-300">
            <AlertTriangle className="size-4" />
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-none tracking-[-0.07em] sm:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">{message}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
            >
              <Home className="size-4" />
              Home
            </Link>
            <Link
              href="/search"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black uppercase tracking-[0.14em] text-white/76 transition hover:border-white hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Search
            </Link>
            {reset && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-black uppercase tracking-[0.14em] text-white/76 transition hover:border-white hover:text-white"
              >
                <RefreshCw className="size-4" />
                Try again
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { label: "Latest reporting", href: "/" },
            { label: "Politics", href: "/category/politics" },
            { label: "Contact newsroom", href: "/contact" }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-black/10 bg-white p-5 font-black tracking-[-0.03em] text-[#111] editorial-shadow transition hover:-translate-y-1 hover:text-red-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
