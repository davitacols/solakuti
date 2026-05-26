"use client";

import { Zap } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Article } from "@/types/article";
import { SportsFixture } from "@/types/sports";

type BreakingNewsBarProps = {
  articles: Article[];
  fixtures?: SportsFixture[];
};

type TickerItem = {
  id: string;
  href: string;
  label: string;
};

function fixtureTime(fixture: SportsFixture) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(fixture.kickoff_at));
}

function fixtureLabel(fixture: SportsFixture) {
  const home = fixture.home_team.short_name || fixture.home_team.name;
  const away = fixture.away_team.short_name || fixture.away_team.name;
  const score = `${fixture.home_score} - ${fixture.away_score}`;

  if (fixture.status === "live" || fixture.status === "halftime") {
    return `Live: ${home} ${score} ${away}`;
  }

  if (fixture.status === "finished") {
    return `Result: ${home} ${score} ${away}`;
  }

  return `Fixture: ${home} vs ${away} - ${fixtureTime(fixture)}`;
}

function fixtureRank(fixture: SportsFixture) {
  if (fixture.status === "live" || fixture.status === "halftime") return 0;
  if (fixture.status === "finished") return 1;
  return 2;
}

export default function BreakingNewsBar({ articles, fixtures = [] }: BreakingNewsBarProps) {
  const headlines = articles.filter((article) => article.breaking || article.category === "Breaking News").concat(articles);
  const articleItems: TickerItem[] = headlines.slice(0, 6).map((article) => ({
    id: `article-${article.id}`,
    href: `/article/${article.slug}`,
    label: article.title
  }));
  const fixtureItems: TickerItem[] = fixtures
    .slice()
    .sort((a, b) => fixtureRank(a) - fixtureRank(b) || new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())
    .slice(0, 6)
    .map((fixture) => ({
      id: `fixture-${fixture.id}`,
      href: `/livescores/match/${fixture.id}`,
      label: fixtureLabel(fixture)
    }));
  const items = [...fixtureItems, ...articleItems].slice(0, 10);
  const tickerItems = [...items, ...items];

  return (
    <section className="border-b border-black/10 bg-[#111] text-white" aria-label="Breaking news">
      <div className="container-page flex h-12 items-center overflow-hidden">
        <div className="mr-5 flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
          <Zap className="size-3.5 fill-white" />
          Breaking
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap">
            {tickerItems.map((item, index) => (
              <LoadingLink
                href={item.href}
                key={`${item.id}-${index}`}
                className="inline text-sm font-semibold text-white/82 transition hover:text-white"
              >
                {item.label}
              </LoadingLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
