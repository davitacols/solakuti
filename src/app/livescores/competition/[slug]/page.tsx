import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ListOrdered, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import LeagueGroup from "@/components/sports/LeagueGroup";
import StandingsTable from "@/components/sports/StandingsTable";
import { getCompetitionFixtures, getCompetitionStandings, getLatestArticles, getSportsCompetitions } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

type CompetitionPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitions = await getSportsCompetitions();
  const competition = competitions.find((item) => item.slug === slug);
  return competition
    ? buildPageMetadata({
        title: `${competition.name} Live Scores`,
        description: `Follow ${competition.name} fixtures, live scores, results and table on Solakuti Sports.`,
        path: `/livescores/competition/${competition.slug}`,
        image: competition.logo_url,
        imageAlt: `${competition.name} live scores`
      })
    : { title: "Competition not found" };
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
  const { slug } = await params;
  const [competitions, fixtures, standings, latestArticles] = await Promise.all([
    getSportsCompetitions(),
    getCompetitionFixtures(slug),
    getCompetitionStandings(slug),
    getLatestArticles()
  ]);
  const competition = competitions.find((item) => item.slug === slug);

  if (!competition) {
    notFound();
  }

  const finished = fixtures.filter((fixture) => fixture.status === "finished").length;
  const upcoming = fixtures.filter((fixture) => fixture.status !== "finished").length;
  const relatedArticles = latestArticles
    .filter((article) => {
      const haystack = [article.title, article.excerpt, article.category, ...(article.tags ?? [])].join(" ").toLowerCase();
      return haystack.includes("sports") || haystack.includes(competition.name.toLowerCase());
    })
    .slice(0, 4);

  return (
    <main className="bg-[#f8f5ef]">
      <section className="border-b border-black/10 bg-[#0d0d0d] text-white">
        <div className="container-page py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-400">
            <Trophy className="size-4" />
            Competition
          </p>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.07em] sm:text-7xl">
            {competition.name}
          </h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Country</p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{competition.country || "Football"}</p>
            </div>
            <div className="border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Upcoming</p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{upcoming}</p>
            </div>
            <div className="border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Results</p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{finished}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-8">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
              <CalendarDays className="size-4" />
              Fixtures and results
            </p>
            <LeagueGroup title={competition.name} fixtures={fixtures} />
          </div>
          <div className="border border-black/10 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Competition news</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedArticles.map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`} className="border border-black/10 p-4 transition hover:-translate-y-1 hover:border-red-600">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/35">{article.category}</p>
                  <p className="mt-2 text-sm font-black leading-5 tracking-[-0.02em]">{article.title}</p>
                </Link>
              ))}
              {!relatedArticles.length && <p className="text-sm font-bold text-black/45">Related articles will appear here.</p>}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
            <ListOrdered className="size-4" />
            Table
          </p>
          <StandingsTable standings={standings} />
        </div>
      </section>
    </main>
  );
}
