# Solakuti Backend

Modern Django REST backend for Solakuti, a premium Nigerian newsroom platform.

## Stack

- Django 5
- Django REST Framework
- PostgreSQL via `DATABASE_URL`
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
python manage.py seed_newsroom
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
```

Demo editorial accounts created by `seed_newsroom` all use:

```text
SolakutiPass123!
```

## Deployment Notes

- Set `DJANGO_DEBUG=False` in production. `DJANGO_DEBUG` is preferred over generic `DEBUG` to avoid hosting environment collisions.
- Configure `DATABASE_URL` with your Render PostgreSQL connection string.
- Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
- Set `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to your production domains.
- Use `gunicorn core.wsgi:application` for production serving.
