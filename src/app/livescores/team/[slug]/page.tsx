import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import LeagueGroup from "@/components/sports/LeagueGroup";
import TeamBadge from "@/components/sports/TeamBadge";
import { getLatestArticles, getSportsTeams, getTeamFixtures } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teams = await getSportsTeams();
  const team = teams.find((item) => item.slug === slug);
  return team
    ? buildPageMetadata({
        title: `${team.name} Fixtures and Results`,
        description: `Follow ${team.name} fixtures, results and match updates on Solakuti Sports.`,
        path: `/livescores/team/${team.slug}`,
        image: team.crest_url,
        imageAlt: `${team.name} team page`
      })
    : { title: "Team not found" };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const [teams, fixtures, latestArticles] = await Promise.all([getSportsTeams(), getTeamFixtures(slug), getLatestArticles()]);
  const team = teams.find((item) => item.slug === slug);

  if (!team) {
    notFound();
  }

  const nextFixture = fixtures.find((fixture) => fixture.status !== "finished");
  const relatedArticles = latestArticles
    .filter((article) => [article.title, article.excerpt, ...(article.tags ?? [])].join(" ").toLowerCase().includes(team.name.toLowerCase()))
    .slice(0, 4);

  return (
    <main className="bg-[#f8f5ef]">
      <section className="border-b border-black/10 bg-white">
        <div className="container-page py-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Team centre</p>
          <div className="mt-5">
            <TeamBadge team={team} />
          </div>
          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.07em] text-[#111] sm:text-7xl">
            {team.name}
          </h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="border border-black/10 bg-[#f7f4ef] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/42">Country</p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em]">{team.country || "Football"}</p>
            </div>
            <div className="border border-black/10 bg-[#f7f4ef] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/42">Fixtures</p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em]">{fixtures.length}</p>
            </div>
            <div className="border border-black/10 bg-[#111] p-4 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Next up</p>
              <p className="mt-2 truncate text-xl font-black tracking-[-0.04em]">
                {nextFixture ? `${nextFixture.home_team.short_name || nextFixture.home_team.name} vs ${nextFixture.away_team.short_name || nextFixture.away_team.name}` : "No fixture"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
            <CalendarDays className="size-4" />
            Fixtures and results
          </p>
          <LeagueGroup title={team.name} fixtures={fixtures} />
        </div>
        <aside className="border border-black/10 bg-white p-5 self-start">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
            <Trophy className="size-4" />
            Team news
          </p>
          <div className="mt-4 divide-y divide-black/10">
            {relatedArticles.map((article) => (
              <Link key={article.id} href={`/article/${article.slug}`} className="block py-4 transition hover:text-red-600">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/35">{article.category}</p>
                <p className="mt-1 text-sm font-black leading-5 tracking-[-0.02em]">{article.title}</p>
              </Link>
            ))}
            {!relatedArticles.length && <p className="py-4 text-sm font-bold text-black/45">Team stories will appear here.</p>}
          </div>
        </aside>
      </section>
    </main>
  );
}
