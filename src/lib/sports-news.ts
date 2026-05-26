import { Article } from "@/types/article";
import { SportsCompetition, SportsFixture, SportsTeam } from "@/types/sports";

function normalize(value?: string | null) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function articleHaystack(article: Article) {
  return normalize([
    article.title,
    article.excerpt,
    article.category,
    article.author,
    ...(article.tags ?? [])
  ].join(" "));
}

function containsTerm(haystack: string, term?: string | null) {
  const clean = normalize(term);
  if (!clean || clean.length < 3) return false;
  return haystack.includes(clean);
}

function sportsBaseScore(article: Article) {
  const haystack = articleHaystack(article);
  let score = 0;

  if (normalize(article.category) === "sports") score += 8;
  if (containsTerm(haystack, "football")) score += 2;
  if (containsTerm(haystack, "premier league")) score += 2;
  if (containsTerm(haystack, "champions league")) score += 2;
  if (containsTerm(haystack, "la liga")) score += 2;
  if (containsTerm(haystack, "serie a")) score += 2;
  if (containsTerm(haystack, "bundesliga")) score += 2;

  return score;
}

function byPublishedDate(a: Article, b: Article) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function rankedArticles(articles: Article[], scoreArticle: (article: Article) => number, limit: number) {
  return articles
    .map((article) => ({ article, score: scoreArticle(article) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byPublishedDate(a.article, b.article))
    .slice(0, limit)
    .map(({ article }) => article);
}

export function getSportsArticles(articles: Article[], limit = 6) {
  return rankedArticles(articles, sportsBaseScore, limit);
}

export function getCompetitionArticles(articles: Article[], competition: SportsCompetition, limit = 6) {
  return rankedArticles(articles, (article) => {
    const haystack = articleHaystack(article);
    let score = sportsBaseScore(article);
    if (containsTerm(haystack, competition.name)) score += 10;
    if (containsTerm(haystack, competition.country)) score += 2;
    return score;
  }, limit);
}

export function getTeamArticles(articles: Article[], team: SportsTeam, limit = 6) {
  return rankedArticles(articles, (article) => {
    const haystack = articleHaystack(article);
    let score = sportsBaseScore(article);
    if (containsTerm(haystack, team.name)) score += 12;
    if (containsTerm(haystack, team.short_name)) score += 8;
    if (containsTerm(haystack, team.country)) score += 1;
    return score;
  }, limit);
}

export function getFixtureArticles(articles: Article[], fixture: SportsFixture, limit = 6) {
  return rankedArticles(articles, (article) => {
    const haystack = articleHaystack(article);
    let score = sportsBaseScore(article);
    if (containsTerm(haystack, fixture.competition.name)) score += 6;
    if (containsTerm(haystack, fixture.home_team.name)) score += 10;
    if (containsTerm(haystack, fixture.home_team.short_name)) score += 6;
    if (containsTerm(haystack, fixture.away_team.name)) score += 10;
    if (containsTerm(haystack, fixture.away_team.short_name)) score += 6;
    return score;
  }, limit);
}
