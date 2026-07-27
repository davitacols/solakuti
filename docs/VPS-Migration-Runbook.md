# Solakuti VPS Migration Runbook

Moving off Render (backend + Postgres + crons), Vercel (frontend) and Cloudinary
(images) onto a single VPS with Docker Compose, to cut recurring cost.

- **Target VPS:** `deploy@188.245.60.155` (Docker already installed)
- **Stack:** Postgres · Django/Gunicorn · Next.js · Nginx (TLS + static/media)
- **Media:** self-hosted on the VPS disk, served by Nginx at `/media/`
- **Domain:** `www.solakuti.com` canonical, apex redirects to www

> Estimated downtime: 1–3 hours, mostly the database + image transfer. The
> Vercel maintenance page (`MAINTENANCE_MODE=on`) covers the public site during
> the window until DNS points at the VPS.

---

## Repo artifacts this runbook uses

| File | Purpose |
|---|---|
| `Dockerfile` | Next.js production image (standalone) |
| `backend/Dockerfile` | Django image |
| `backend/entrypoint.sh` | migrate (both DBs) + collectstatic + gunicorn |
| `deploy/docker-compose.prod.yml` | the full stack |
| `deploy/nginx.conf` | reverse proxy + TLS + static/media |
| `deploy/postgres-init/01-create-sports-db.sh` | creates the sports DB on first boot |
| `deploy/.env.prod.example` | copy to `deploy/.env.prod` and fill in |

---

## Phase 0 — Before the downtime window (no impact, do in advance)

1. **Lower DNS TTL.** At your DNS provider, set the TTL on the `solakuti.com` and
   `www` records to 300s (5 min). Do this a day ahead so the cutover propagates fast.

2. **Install the Compose plugin & firewall** on the VPS:
   ```sh
   ssh deploy@188.245.60.155
   docker compose version   # confirm the v2 plugin is present
   sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
   ```

3. **Clone the repo** and prepare env:
   ```sh
   git clone https://github.com/davitacols/solakuti.git ~/solakuti
   cd ~/solakuti
   cp deploy/.env.prod.example deploy/.env.prod
   nano deploy/.env.prod        # fill in secrets — see the file's comments
   ```
   Generate strong values:
   ```sh
   python3 -c "import secrets; print(secrets.token_urlsafe(48))"   # SECRET_KEY
   python3 -c "import secrets; print(secrets.token_urlsafe(24))"   # POSTGRES_PASSWORD
   ```
   Keep `CLOUDINARY_*` filled in — the image migration needs them.

4. **Get TLS certificates** (one-time, before first full boot). Bring up a
   throwaway Nginx that serves only the ACME challenge, then request certs:
   ```sh
   mkdir -p deploy/certbot/www deploy/certbot/conf
   # temporary HTTP-only server for the challenge
   docker run --rm -p 80:80 -v $PWD/deploy/certbot/www:/usr/share/nginx/html \
     -d --name acme nginx:1.27-alpine

   docker run --rm \
     -v $PWD/deploy/certbot/conf:/etc/letsencrypt \
     -v $PWD/deploy/certbot/www:/var/www/certbot \
     certbot/certbot certonly --webroot -w /var/www/certbot \
     -d solakuti.com -d www.solakuti.com \
     --email editorial@solakuti.com --agree-tos --no-eff-email
   docker stop acme
   ```
   > DNS must already point at the VPS for the challenge to pass. If you can't
   > repoint yet, use `--preferred-challenges dns` and add the TXT record instead.

---

## Phase 1 — Snapshot the current data (start of window)

1. **Turn on the maintenance page** so the live site stops taking writes:
   Vercel → env → `MAINTENANCE_MODE=on`, `MAINTENANCE_BYPASS_TOKEN=<random>` →
   redeploy. Confirm `https://www.solakuti.com` shows the notice.

2. **Dump both Render databases** (from the VPS or your laptop; needs `postgresql-client`).
   Use each service's **External Database URL** from the Render dashboard:
   ```sh
   pg_dump "$RENDER_MAIN_DB_URL"   -Fc --no-owner --no-privileges -f main.dump
   pg_dump "$RENDER_SPORTS_DB_URL" -Fc --no-owner --no-privileges -f sports.dump
   ```
   If the sports data lived in the same Render DB as the main app, you only have
   one dump — restore it into `solakuti` and skip the sports restore.

3. Copy the dumps to the VPS if you made them locally:
   ```sh
   scp main.dump sports.dump deploy@188.245.60.155:~/solakuti/
   ```

---

## Phase 2 — Bring up data services and restore

1. **Start Postgres only**, so the auto-migrate in the backend doesn't create a
   conflicting schema before the restore:
   ```sh
   cd ~/solakuti
   docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d --build db
   docker compose -f deploy/docker-compose.prod.yml exec db pg_isready -U solakuti
   ```

2. **Restore** the full dumps into the empty databases:
   ```sh
   docker compose -f deploy/docker-compose.prod.yml exec -T db \
     pg_restore --no-owner --no-privileges -U solakuti -d solakuti < main.dump
   docker compose -f deploy/docker-compose.prod.yml exec -T db \
     pg_restore --no-owner --no-privileges -U solakuti -d solakuti_sports < sports.dump
   ```
   Harmless "already exists" notices from `pg_restore` are fine.

3. **Start the backend.** Its entrypoint applies only the *new* migrations on top
   of the restored schema (e.g. the journalist-onboarding migration) and collects static:
   ```sh
   docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d --build backend
   docker compose -f deploy/docker-compose.prod.yml logs -f backend   # watch migrate run
   ```

---

## Phase 3 — Migrate images off Cloudinary to the VPS

`MEDIA_PROVIDER=local` is set, so this pulls each Cloudinary original and writes it
to the `media_data` volume, rewriting each DB file field to the local path.

> Cloudinary must still be **paid and reachable** at this point — the job
> downloads originals from it.

```sh
# preview
docker compose -f deploy/docker-compose.prod.yml exec backend \
  python manage.py migrate_media_to_r2 --dry-run
# run it
docker compose -f deploy/docker-compose.prod.yml exec backend \
  python manage.py migrate_media_to_r2
```
Spot-check that files landed:
```sh
docker compose -f deploy/docker-compose.prod.yml exec backend ls -R /app/mediafiles | head
```

---

## Phase 4 — Bring up the web tier and verify

1. **Start frontend + Nginx:**
   ```sh
   docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d --build frontend nginx
   docker compose -f deploy/docker-compose.prod.yml ps
   ```

2. **Verify by IP / bypass before cutover.** Add a temporary hosts entry on your
   laptop (`188.245.60.155 www.solakuti.com`) or curl with a Host header:
   ```sh
   curl -k -H 'Host: www.solakuti.com' https://188.245.60.155/api/articles/?page_size=1
   curl -k -H 'Host: www.solakuti.com' https://188.245.60.155/ | grep -c '/article/'
   ```
   Check: articles list, an article page, an image under `/media/`, and admin login.

---

## Phase 5 — Cutover

1. **Repoint DNS**: `A  solakuti.com → 188.245.60.155` and `A  www → 188.245.60.155`.
   With the 5-min TTL, propagation is quick.

2. Once DNS resolves to the VPS, **create your admin user** (if not already in the
   restored data):
   ```sh
   docker compose -f deploy/docker-compose.prod.yml exec backend python manage.py createsuperuser
   ```

3. **Turn maintenance off.** Because the frontend now runs on the VPS, set
   `MAINTENANCE_MODE=off` in `deploy/.env.prod` and recreate the frontend:
   ```sh
   docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d frontend
   ```
   (The Vercel deployment can stay as-is until you decommission it.)

4. Browse the live site and confirm everything renders from the VPS.

---

## Phase 6 — Cron jobs

Render's cron jobs (`sync_live_scores`, `sync_sports_provider`) become host
crontab entries calling the backend container. **Match the cadence you used on
Render** — the defaults below are a reasonable starting point:

```sh
crontab -e
```
```cron
# Fast live-score refresh, every 2 minutes
*/2 * * * * cd /home/deploy/solakuti && docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod exec -T backend python manage.py sync_live_scores >> /var/log/solakuti-cron.log 2>&1

# Full fixtures/teams/standings sync, every 6 hours
0 */6 * * * cd /home/deploy/solakuti && docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod exec -T backend python manage.py sync_sports_provider >> /var/log/solakuti-cron.log 2>&1
```

---

## Phase 7 — Backups (set up before you decommission Render)

Nightly Postgres dump + media are now your responsibility:
```cron
# 02:30 nightly DB backup, keep 14 days
30 2 * * * cd /home/deploy/solakuti && docker compose -f deploy/docker-compose.prod.yml exec -T db sh -c 'pg_dump -U solakuti solakuti | gzip' > /home/deploy/backups/solakuti-$(date +\%F).sql.gz && find /home/deploy/backups -name '*.sql.gz' -mtime +14 -delete
```
Also periodically copy the `media_data` volume off-box (e.g. `rsync` to another
host or object storage). Losing the VPS disk now means losing uploads.

---

## Rollback

Nothing is destroyed until you decommission the old services, so rollback is just
DNS:

1. Point DNS back to Vercel (frontend) / the Render domain.
2. Set `MAINTENANCE_MODE=off` on Vercel.
3. Investigate the VPS out of band.

Keep Render, Vercel and Cloudinary **running and paid for ~1 week** after cutover
as a safety net. Only decommission once the VPS has proven stable and you have a
verified backup.

---

## Phase 8 — Decommission (after ~1 week stable)

- Vercel: delete the project (or leave on free tier as a warm standby).
- Render: suspend the web service, both databases (after a final dump), and crons.
- Cloudinary: **only after confirming every image serves from `/media/`** — cancel
  the plan. Verify with:
  ```sh
  curl -s https://www.solakuti.com/api/articles/?page_size=50 | grep -o 'res.cloudinary.com' | wc -l   # want 0
  ```

---

## Notes & gotchas

- **`SECURE_SSL_REDIRECT=False`** in env — Nginx already does the HTTP→HTTPS
  redirect. Leaving Django's redirect on as well can cause loops behind the proxy.
- **Cert renewal:** add a monthly `certbot renew` (via a certbot container) and
  reload Nginx. Let's Encrypt certs last 90 days.
- **`client_max_body_size 60m`** in Nginx matches the 50 MB Django upload limit;
  raise both together if you need larger video uploads.
- **Two databases, one Postgres:** both DBs live in the same instance; the
  `core.db_router` sends the `sports` app to `solakuti_sports`. The entrypoint
  migrates both.
- **Image migration is one-way and depends on Cloudinary being reachable.** If
  Cloudinary is suspended for non-payment, restore/keep it paid until Phase 3 completes.
