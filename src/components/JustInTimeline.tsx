import { Clock } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";

type JustInTimelineProps = {
  articles: Article[];
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function JustInTimeline({ articles }: JustInTimelineProps) {
  if (!articles.length) return null;

  return (
    <aside className="border-t-2 border-black pt-6">
      <div className="flex items-center gap-2 pb-4">
        <Clock className="size-4 text-red-600" />
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#111]">Just In</h2>
      </div>
      <div className="relative border-l-2 border-red-600/20 pl-5">
        {articles.slice(0, 5).map((article) => (
          <article key={article.id} className="relative pb-5 last:pb-0">
            <span className="absolute -left-[9px] top-1.5 size-2.5 rounded-full border-2 border-red-600 bg-white" />
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600">
              {timeAgo(article.publishedAt)}
            </p>
            <LoadingLink
              href={`/article/${article.slug}`}
              className="mt-1 block text-sm font-bold leading-snug text-[#111] transition hover:text-red-600"
            >
              {article.title}
            </LoadingLink>
            <p className="mt-0.5 text-[11px] font-bold text-black/40">{article.category}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
