import { Flame } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

type TrendingSidebarProps = {
  articles: Article[];
};

export default function TrendingSidebar({ articles }: TrendingSidebarProps) {
  return (
    <aside className="border-t-2 border-black bg-[#111] p-5 text-white xl:sticky xl:top-28">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <Flame className="size-5 text-red-500" />
        <h2 className="text-xl font-black tracking-[-0.04em]">Trending Now</h2>
      </div>
      <div className="divide-y divide-white/10">
        {articles.slice(0, 5).map((article, index) => (
          <article key={article.id} className="group py-5">
            <div className="flex gap-4">
              <span className="text-3xl font-black tracking-[-0.08em] text-white/18">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <LoadingLink
                  href={`/article/${article.slug}`}
                  className="inline font-black leading-snug tracking-[-0.03em] transition group-hover:text-red-400"
                >
                  {article.title}
                </LoadingLink>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/38">
                  {formatDate(article.publishedAt)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
