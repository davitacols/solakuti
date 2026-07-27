#!/bin/sh
set -e

# Apply migrations to both databases (sports models are routed to the sports DB).
python manage.py migrate --noinput
python manage.py migrate --database=sports --noinput

# Collect static into the shared volume Nginx serves.
python manage.py collectstatic --noinput

exec gunicorn core.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${WEB_CONCURRENCY:-3}" \
  --threads "${WEB_THREADS:-4}" \
  --timeout "${WEB_TIMEOUT:-60}"
