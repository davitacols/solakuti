"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, Copy, Facebook, MessageCircle, Radio, Twitter } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { Article } from "@/types/article";
import { categoryToSlug, formatDate } from "@/lib/utils";

type DistributionPanelProps = {
  articles: Article[];
};

type ChannelDraft = {
  id: string;
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  content: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com";

function getDistributionSiteUrl() {
  if (typeof window !== "undefined" && window.location.hostname.endsWith("solakuti.com")) {
    return window.location.origin;
  }
  return SITE_URL.replace("https://solakuti.vercel.app", "https://solakuti.com");
}

function buildHashtags(article: Article) {
  const categoryTag = article.category.replace(/\s+/g, "");
  return ["Solakuti", "Nigeria", categoryTag].map((tag) => `#${tag}`).join(" ");
}

export default function DistributionPanel({ articles }: DistributionPanelProps) {
  const [selectedSlug, setSelectedSlug] = useState(articles[0]?.slug ?? "");
  const [copied, setCopied] = useState<string | null>(null);
  const feedLinks = useMemo(() => {
    const categoryNames = Array.from(new Set(articles.map((article) => article.category))).slice(0, 8);
    return [
      { label: "Main RSS", href: "/rss.xml" },
      { label: "News sitemap", href: "/news-sitemap.xml" },
      { label: "Standard sitemap", href: "/sitemap.xml" },
      ...categoryNames.map((category) => ({
        label: `${category} RSS`,
        href: `/feeds/${categoryToSlug(category)}.xml`
      }))
    ];
  }, [articles]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.slug === selectedSlug) ?? articles[0],
    [articles, selectedSlug]
  );

  const drafts = useMemo<ChannelDraft[]>(() => {
    if (!selectedArticle) {
      return [];
    }

    const url = `${getDistributionSiteUrl()}/article/${selectedArticle.slug}`;
    const hashtags = buildHashtags(selectedArticle);

    return [
      {
        id: "x-post",
        title: "X / Twitter",
        eyebrow: "Link post",
        icon: Twitter,
        content: `${selectedArticle.title}\n\n${selectedArticle.excerpt}\n\n${url}\n\n${hashtags}`
      },
      {
        id: "facebook-caption",
        title: "Facebook caption",
        eyebrow: "No link in post",
        icon: Facebook,
        content: `${selectedArticle.title}\n\n${selectedArticle.excerpt}\n\nFull story in the first comment.`
      },
      {
        id: "facebook-comment",
        title: "Facebook first comment",
        eyebrow: "Manual link drop",
        icon: Facebook,
        content: url
      },
      {
        id: "whatsapp",
        title: "WhatsApp",
        eyebrow: "Broadcast copy",
        icon: MessageCircle,
        content: `${selectedArticle.title}\n\n${selectedArticle.excerpt}\n\nRead: ${url}`
      }
    ];
  }, [selectedArticle]);

  async function copyText(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1400);
  }

  if (!articles.length) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Distribution</p>
        <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">No stories ready to distribute.</h3>
        <p className="mt-3 text-sm leading-6 text-black/55">
          Published articles will appear here with ready-to-copy social drafts and feed links.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="size-5 text-red-600" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Distribution desk</p>
          </div>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111]">
            Push reports into feeds and social channels.
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/58">
            RSS, sitemap and article schema help browser news surfaces discover stories automatically.
            Social drafts keep X, WhatsApp and the Facebook comment-link workflow fast for editors.
          </p>
        </div>

        <div className="rounded-md bg-[#111] p-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">Discovery links</p>
          <div className="mt-3 space-y-2 text-sm font-bold">
            {feedLinks.slice(0, 5).map((link) => (
              <a key={link.href} href={link.href} target="_blank" className="block rounded-md bg-white/8 px-3 py-2 transition hover:bg-white/14">
                {link.href}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-black/10 bg-[#f7f4ef] p-3">
        <label className="text-xs font-black uppercase tracking-[0.18em] text-black/42" htmlFor="distribution-article">
          Select report
        </label>
        <select
          id="distribution-article"
          value={selectedArticle?.slug ?? ""}
          onChange={(event) => setSelectedSlug(event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-black text-[#111] outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
        >
          {articles.map((article) => (
            <option key={article.slug} value={article.slug}>
              {article.title}
            </option>
          ))}
        </select>
        {selectedArticle && (
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-black/38">
            {selectedArticle.category} - {formatDate(selectedArticle.publishedAt)}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {drafts.map(({ id, title, eyebrow, icon: Icon, content }) => (
          <article key={id} className="rounded-lg border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:border-black/20 hover:shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-black text-white">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">{eyebrow}</p>
                  <h4 className="text-lg font-black tracking-[-0.04em] text-[#111]">{title}</h4>
                </div>
              </div>
              <LoadingButton
                type="button"
                onClick={() => copyText(id, content)}
                className="h-10 rounded-full border border-black/10 px-4 text-xs font-black uppercase tracking-[0.12em] transition hover:border-black hover:bg-black hover:text-white"
              >
                {copied === id ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied === id ? "Copied" : "Copy"}
              </LoadingButton>
            </div>
            <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-black/[0.035] p-3 text-sm leading-6 text-black/68">
              {content}
            </pre>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-black/10 bg-[#111] p-4 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Publisher submission pack</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {feedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              className="rounded-md bg-white/8 px-3 py-2 text-sm font-bold text-white/76 transition hover:bg-white/14 hover:text-white"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/38">{link.label}</span>
              {link.href}
            </a>
          ))}
        </div>
        <div className="mt-4 grid gap-2 text-sm font-bold sm:grid-cols-2 lg:grid-cols-4">
          {["/about", "/contact", "/editorial-policy", "/privacy-policy"].map((href) => (
            <a key={href} href={href} target="_blank" className="rounded-md border border-white/10 px-3 py-2 text-white/68 transition hover:border-white hover:text-white">
              {href}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
