import Image from "next/image";
import { Star } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

type EditorsPickProps = {
  article: Article;
};

export default function EditorsPick({ article }: EditorsPickProps) {
  return (
    <section className="container-page py-8">
      <div className="overflow-hidden rounded-lg border-2 border-black bg-white editorial-shadow lg:grid lg:grid-cols-[1fr_1fr]">
        <div className="relative aspect-[16/9] lg:aspect-auto">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800">
            <Star className="size-3.5 fill-amber-600" />
            Editor&apos;s pick
          </div>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] text-[#111] sm:text-3xl lg:text-4xl">
            <LoadingLink href={`/article/${article.slug}`} className="transition hover:text-red-600">
              {article.title}
            </LoadingLink>
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/62">{article.excerpt}</p>
          <div className="mt-5 flex items-center gap-3 text-xs font-bold text-black/48">
            <span>{article.author}</span>
            <span className="size-1 rounded-full bg-black/20" />
            <span>{formatDate(article.publishedAt)}</span>
            <span className="size-1 rounded-full bg-black/20" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
