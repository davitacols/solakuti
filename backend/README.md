# Solakuti Backend

Modern Django REST backend for Solakuti, a premium Nigerian newsroom platform.

## Stack

- Django 5
- Django REST Framework
- PostgreSQL via `DATABASE_URL`
- Optional separate LiveScore PostgreSQL database via `SPORTS_DATABASE_URL`
- SimpleJWT authentication
- Cloudinary media storage
- CORS, throttling and Swagger/OpenAPI docs

## Local Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API docs:

```text
http://localhost:8000/api/docs/
http://localhost:8000/api/schema/
```

## Key Endpoints

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/profile/

GET  /api/articles/
GET  /api/articles/featured/
GET  /api/articles/breaking/
GET  /api/articles/trending/
GET  /api/articles/latest/
GET  /api/articles/{slug}/

GET  /api/categories/
GET  /api/categories/{slug}/
GET  /api/categories/{slug}/articles/

GET  /api/comments/
POST /api/comments/

GET  /api/search/?q=lagos
GET  /api/analytics/overview/

GET  /api/sports/fixtures/today/
GET  /api/sports/fixtures/live/
GET  /api/sports/fixtures/upcoming/
GET  /api/sports/fixtures/results/
GET  /api/sports/competitions/
GET  /api/sports/standings/
```

## LiveScore Setup

The sports pages use real upstream provider data only. No dummy LiveScore data is auto-seeded.

For real football data with API-Football/API-SPORTS, add these environment variables:

```env
SPORTS_PROVIDER=api_football
API_FOOTBALL_API_KEY=your-api-football-key
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
API_FOOTBALL_COMPETITIONS=PL,CL,BL1,DED,BSA,PD,FL1,ELC,PPL,EC,SA,WC
API_FOOTBALL_SEASON=2025
API_FOOTBALL_SYNC_DETAILS=True
API_FOOTBALL_TIMEOUT_SECONDS=35
API_FOOTBALL_MAX_ATTEMPTS=3
```

Then sync fixtures, teams, standings, events, lineups and match statistics:

```bash
python manage.py migrate
python manage.py sync_sports_provider --days-back 0 --days-ahead 1
```

Run the command without `--competition` to sync every league in `API_FOOTBALL_COMPETITIONS`. Use `--competition` only when you intentionally want to limit the sync to one or more leagues:

```bash
python manage.py sync_sports_provider --competition PL --competition CL --days-back 2 --days-ahead 14
```

For frequent LiveScore updates, use the lightweight command below. It updates today/live-window fixtures, scores, match minutes, events, lineups and statistics, but skips heavy standings and full team imports:

```bash
python manage.py sync_live_scores --days-back 0 --days-ahead 1
```

Recommended Render cron setup:

```text
Every 2-5 minutes during match windows:
python manage.py sync_live_scores --days-back 0 --days-ahead 1

Every 6-12 hours:
python manage.py sync_sports_provider --days-back 1 --days-ahead 14
```

For production, use a separate sports database so LiveScore sync does not consume the main newsroom database quota:

```env
DATABASE_URL=postgresql://main-newsroom-db
SPORTS_DATABASE_URL=postgresql://sports-livescore-db
```

When `SPORTS_DATABASE_URL` is set, Django routes only the `sports` app to that database. The sync command automatically applies sports migrations to the sports database before importing provider data:

```bash
python manage.py sync_sports_provider --days-back 0 --days-ahead 1
```

After confirming `SPORTS_DATABASE_URL` is working, remove old LiveScore tables from the main/default database:

```bash
python manage.py drop_legacy_sports_tables
python manage.py drop_legacy_sports_tables --confirm
```

The first command is a dry run and lists the exact `sports_*` tables that would be dropped. The confirmed command permanently deletes only the old sports tables from the main database.

If old demo content exists from a previous development seed, remove it with:

```bash
python manage.py purge_dummy_data
python manage.py purge_dummy_data --confirm
```

The first command is a dry run. It lists the exact demo records that would be removed. Add `--confirm` only after checking the preview.

If published WordPress posts need to be recovered into the Django newsroom, import them from the public WordPress REST API:

```bash
python manage.py import_wordpress_posts --source https://solakuti.com --limit 200 --download-images
```

Supported API-Football aliases currently configured:

```text
WC  - FIFA World Cup
CL  - UEFA Champions League
UEL - UEFA Europa League
PL  - Premier League
ELC - Championship
FL1 - Ligue 1
BL1 - Bundesliga
DED - Eredivisie
BSA - Campeonato Brasileiro Serie A
PD  - Primera Division
PPL - Primeira Liga
EC  - European Championship
SA  - Serie A
```

Render can run the sync command manually from the shell. For automated updates, add a cron job or scheduled worker that runs `python manage.py sync_sports_provider` every few minutes during match windows and less often outside match windows.

The API-Football sync client inspects provider response headers such as `Retry-After` and `x-ratelimit-requests-remaining` so it can back off automatically before hitting the rate limiter.

## Deployment Notes

- Set `DJANGO_DEBUG=False` in production. `DJANGO_DEBUG` is preferred over generic `DEBUG` to avoid hosting environment collisions.
- Configure `DATABASE_URL` with your Render PostgreSQL connection string.
- Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
- Set `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to your production domains.
- Use `gunicorn core.wsgi:application` for production serving.
