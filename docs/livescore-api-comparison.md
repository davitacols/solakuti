# Solakuti LiveScore API Plan

## Executive Summary

Solakuti can add a LiveScore product similar to a lightweight Sofascore experience, starting with football and expanding later. The safest approach is to build Solakuti's own sports backend first, then connect it to either a free/freemium data source for MVP testing or a paid provider for production reliability.

Recommendation:

- Start with a free/freemium MVP to validate product demand.
- Build the backend in a provider-agnostic way so we can switch data providers later.
- Move to a paid provider before marketing the feature heavily, especially if we want real live scores, match events, lineups, standings, and dependable match coverage.

## Product Goal

Build a Solakuti Sports LiveScore section that keeps readers on the platform and adds sports utility traffic alongside news content.

Primary user experience:

- Today's football matches
- Live matches
- Results
- Fixtures
- League tables
- Match detail pages
- Team pages
- Competition pages
- Related Solakuti sports articles

Initial route ideas:

```text
/livescores
/livescores/match/[id]
/livescores/competition/[slug]
/livescores/team/[slug]
```

## Free and Freemium API Options

### 1. TheSportsDB

Website:
https://www.thesportsdb.com/documentation

Free availability:

- TheSportsDB provides a free API key: `123`.
- Free users are documented at about 30 requests per minute.
- Good for team information, leagues, badges/logos, schedules, previous results, and sports metadata.

Strengths:

- Easy to start.
- Good for team and league pages.
- Provides useful sports images and metadata.
- Supports many sports.

Limitations:

- True livescore features are more limited on the free tier.
- TheSportsDB documentation states that premium includes extra features such as livescores and video highlights.
- Community/crowd-sourced data may not be as reliable as enterprise feeds.

Best Solakuti use:

- MVP team pages
- League metadata
- Team badges/logos
- Fixtures/results where available
- Sports archive pages

### 2. football-data.org

Website:
https://www.football-data.org/

Documentation:
https://www.football-data.org/docs/v2/index.html

Free availability:

- Has a free tier after registration.
- Provides competitions, teams, fixtures, match results, and standings.

Strengths:

- Clean football-specific structure.
- Good for standings and competition pages.
- More structured than many generic free APIs.

Limitations:

- Live match events and deeper match statistics are limited compared with paid sports APIs.
- Coverage and rate limits depend on the plan.
- Not ideal if we want a rich Sofascore-style live match centre.

Best Solakuti use:

- Competition pages
- Standings
- Fixtures
- Results

### 3. API-Football / API-Sports Free Tier

Website:
https://www.api-football.com/

Strengths:

- Football-focused.
- Often includes fixtures, live matches, teams, leagues, standings, events, and statistics.
- Good for prototyping a richer livescore experience.

Limitations:

- Free tier is generally small and best for testing.
- Live polling can quickly exhaust quota.
- Scaling may require a paid plan.

Best Solakuti use:

- MVP testing for live matches
- Match detail page prototype
- Evaluating event/stat quality before paying

## Paid API Options

### 1. Sportmonks

Website:
https://www.sportmonks.com/football-api/plans-pricing/

Documentation:
https://docs.sportmonks.com/football

Livescore endpoint reference:
https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/livescores/get-all-livescores

Indicative pricing:

- Starter plans begin around €29/month.
- Higher tiers increase league coverage and API call volume.
- Pricing depends on selected leagues, add-ons, and usage.

Strengths:

- Strong football coverage.
- Includes livescores, fixtures, events, standings, lineups, teams, statistics, and more depending on plan/add-ons.
- Good documentation.
- More production-ready than most free options.

Limitations:

- Monthly cost.
- Plan selection matters; not every league may be included by default.
- Need careful API usage/caching to avoid overuse.

Best Solakuti use:

- Production football livescore product.
- League tables.
- Match events.
- Match detail pages.
- Lineups and statistics.

### 2. Sportradar

Website:
https://developer.sportradar.com/

Strengths:

- Enterprise-grade reliability.
- Used by large media, betting, broadcast, and sports platforms.
- Strong global coverage and professional data quality.

Limitations:

- Usually expensive.
- Enterprise onboarding may be slower.
- Too heavy for an MVP unless we already have a sports monetization plan.

Best Solakuti use:

- Future enterprise-grade sports product.
- If Solakuti Sports becomes a major business vertical.

## Free vs Paid Comparison

| Area | Free/Freemium APIs | Paid APIs |
|---|---|---|
| Cost | Low or zero | Monthly/enterprise fees |
| Best for | MVP, testing, early validation | Production launch |
| Live scores | Often limited or delayed | Stronger real-time support |
| Match events | Limited/inconsistent | Goals, cards, substitutions, VAR, events |
| Lineups | Often limited | Usually available depending on plan |
| Standings | Available from some providers | More reliable and broader |
| Team/league metadata | Good enough for MVP | Better quality and coverage |
| Rate limits | Usually tight | Higher and more scalable |
| Reliability | Variable | Better support and SLA potential |
| Coverage | Limited by provider/free tier | Better league selection |
| Long-term fit | Not ideal alone | Better for serious sports product |

## Recommended Strategy

Use a two-stage approach.

## Current Solakuti Implementation

Solakuti now has a provider adapter for **football-data.org** as the first real API source. It syncs competitions, teams, fixtures, results, live statuses and standings into Solakuti's own sports tables, then the frontend reads from Solakuti's existing `/api/sports/...` endpoints.

This keeps the product flexible:

- The website only shows real provider data after a successful sync.
- The frontend does not depend directly on any third-party sports API.
- A paid low-latency provider can be added later without redesigning the LiveScore UI.
- Render can run the sync command manually, through a cron job, or through a scheduled worker.
- The provider client checks rate-limit response headers and backs off before making the next request when quota is almost exhausted.

Required environment variables:

```env
SPORTS_PROVIDER=football_data
FOOTBALL_DATA_API_KEY=your-football-data-api-key
FOOTBALL_DATA_COMPETITIONS=WC,CL,BL1,DED,BSA,PD,FL1,ELC,PPL,EC,SA,PL
```

Commands:

```bash
python manage.py migrate
python manage.py sync_sports_provider
python manage.py sync_sports_provider --competition PL --days-back 2 --days-ahead 14
```

Configured competition codes:

| Code | Competition |
|---|---|
| WC | FIFA World Cup |
| CL | UEFA Champions League |
| BL1 | Bundesliga |
| DED | Eredivisie |
| BSA | Campeonato Brasileiro Serie A |
| PD | Primera Division |
| FL1 | Ligue 1 |
| ELC | Championship |
| PPL | Primeira Liga |
| EC | European Championship |
| SA | Serie A |
| PL | Premier League |

### Stage 1: Free MVP

Use free/freemium APIs to validate interest before committing to monthly sports data costs.

Suggested setup:

- TheSportsDB for team/league metadata and images.
- football-data.org for fixtures, standings, and competition data.
- Optional API-Football trial/free tier for testing live match events.

Deliverables:

- `/livescores`
- Today's fixtures
- Results
- League grouping
- Basic standings
- Team pages
- Competition pages
- Sports article integration

Important limitation:

- We should not promise full real-time Sofascore-level accuracy at this stage.

### Stage 2: Paid Production Upgrade

Once the product has reader traction, switch or expand to a paid provider.

Recommended paid provider:

- Sportmonks first.

Why:

- Better balance of cost, documentation, and production features.
- More affordable than enterprise providers.
- Good enough for a serious Solakuti Sports launch.

## Technical Architecture

We should not call third-party sports APIs directly from the frontend.

Instead:

```text
Third-party API → Django sync service → Solakuti database/cache → Solakuti API → Next.js frontend
```

Benefits:

- Protects API keys.
- Reduces third-party API calls.
- Avoids frontend rate-limit problems.
- Keeps pages fast.
- Allows cached fallback when the provider is slow.
- Makes provider switching easier.

## Backend Requirements

Create a new Django app:

```text
backend/apps/sports/
```

Initial models:

```text
Sport
Competition
Season
Team
Venue
Fixture
FixtureEvent
Standing
SportsSyncLog
```

Optional later models:

```text
Player
Lineup
FixtureStatistic
FavoriteTeam
Prediction
```

Core API endpoints:

```text
/api/sports/fixtures/
/api/sports/fixtures/live/
/api/sports/fixtures/today/
/api/sports/fixtures/upcoming/
/api/sports/fixtures/results/
/api/sports/fixtures/{id}/
/api/sports/competitions/
/api/sports/competitions/{slug}/
/api/sports/competitions/{slug}/standings/
/api/sports/teams/{slug}/
```

Admin features:

- Choose visible competitions.
- Pin important matches.
- Link sports articles to fixtures, teams, or competitions.
- View sync status/errors.
- Manually refresh a competition or fixture.

## Sync and Caching Requirements

Suggested sync frequency:

| Data | Frequency |
|---|---|
| Live fixtures | Every 30-60 seconds during live windows |
| Today's fixtures | Every 5 minutes |
| Upcoming fixtures | Every 1-6 hours |
| Results | Every 5-15 minutes after matches |
| Standings | Every 1-6 hours |
| Teams/competitions | Daily or weekly |

For MVP on Render:

- Use Django management commands.
- Use Render Cron Jobs for scheduled sync.
- Store provider responses in database.
- Add `SportsSyncLog` for monitoring.

Later:

- Celery + Redis for background jobs.
- WebSockets/SSE for real-time frontend updates if needed.

## Frontend Requirements

New pages:

```text
src/app/livescores/page.tsx
src/app/livescores/match/[id]/page.tsx
src/app/livescores/competition/[slug]/page.tsx
src/app/livescores/team/[slug]/page.tsx
```

New components:

```text
src/components/sports/LiveScoreBoard.tsx
src/components/sports/DateSelector.tsx
src/components/sports/LeagueGroup.tsx
src/components/sports/MatchCard.tsx
src/components/sports/MatchHeader.tsx
src/components/sports/MatchTimeline.tsx
src/components/sports/StandingsTable.tsx
src/components/sports/TeamBadge.tsx
src/components/sports/SportsNewsRail.tsx
```

UI requirements:

- Mobile-first.
- Compact match cards.
- Fast date switching.
- Tabs for Live, Today, Tomorrow, Finished, Upcoming.
- League grouping.
- Live status indicator.
- Clear score typography.
- Related Solakuti sports articles.

## SEO Requirements

LiveScore can create search traffic if structured properly.

Add:

- `SportsEvent` schema on match pages.
- `SportsTeam` schema on team pages.
- Breadcrumb schema.
- Canonical URLs.
- Sitemap entries for competitions, teams, and match pages.
- Internal links from Sports articles to relevant teams/matches.

Important:

- Avoid indexing low-quality duplicate pages.
- Do not index every tiny fixture page until content quality is good.
- Start with competition/team pages and major match pages.

## Environment Variables Needed

For free MVP:

```text
SPORTS_PROVIDER=thesportsdb
THESPORTSDB_API_KEY=123
FOOTBALL_DATA_API_KEY=your_token_here
SPORTS_CACHE_TTL_SECONDS=60
SPORTS_SYNC_ENABLED=True
```

If using Sportmonks later:

```text
SPORTS_PROVIDER=sportmonks
SPORTMONKS_API_TOKEN=your_token_here
SPORTS_CACHE_TTL_SECONDS=30
SPORTS_SYNC_ENABLED=True
```

## Operational Requirements

To complete this feature properly, Solakuti needs:

- API provider account.
- API key stored securely in Render environment variables.
- Backend sports app.
- Sync commands.
- Database models and migrations.
- Admin monitoring page.
- Frontend LiveScore UI.
- Error handling and cached fallback.
- Rate-limit protection.
- SEO schema and sitemap updates.
- Testing on mobile.

## Risks

### Free API Risks

- Limited live data.
- Rate limits.
- Missing leagues.
- Incomplete match events.
- Data delays.
- No strong support guarantee.

### Paid API Risks

- Monthly cost.
- Provider lock-in if architecture is not abstracted.
- Need careful caching to avoid overuse.
- Some leagues/features may require higher plans.

### Product Risks

- A poor live score experience damages trust.
- If scores are delayed, users may leave.
- Live sports data is harder than static news content.

## Cost-Control Plan

To avoid wasting money:

1. Build the Solakuti sports backend first.
2. Start with free APIs.
3. Cache aggressively.
4. Launch internally or as beta.
5. Track traffic and engagement.
6. Upgrade to paid only after validation.

Success metrics:

- LiveScore page visits.
- Repeat visits.
- Sports article clicks from match pages.
- Search traffic to sports pages.
- User feedback from mobile.
- Average session duration.

## Final Recommendation

For Solakuti, the best path is:

1. Build the LiveScore architecture now.
2. Start with free/freemium data for MVP.
3. Keep the API provider replaceable.
4. Launch a football-only beta.
5. Upgrade to Sportmonks when we are ready for a public, reliable sports product.

This lets Solakuti test the opportunity without committing to paid data immediately, while still building the product in a serious, scalable way.
