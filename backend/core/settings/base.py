from datetime import timedelta
import os
from pathlib import Path

import dj_database_url
from decouple import Csv, config
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def env_bool(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


SECRET_KEY = config("SECRET_KEY", default="unsafe-dev-secret-key-change-me")
DEBUG = env_bool("DJANGO_DEBUG", env_bool("DEBUG", True))
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

if not DEBUG and SECRET_KEY.startswith("unsafe-"):
    raise ImproperlyConfigured("Set a strong SECRET_KEY before running in production.")

if not DEBUG and "*" in ALLOWED_HOSTS:
    raise ImproperlyConfigured("Do not use '*' in ALLOWED_HOSTS in production.")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "corsheaders",
    "drf_spectacular",
    "cloudinary",
    "cloudinary_storage",
    "apps.accounts",
    "apps.categories",
    "apps.news",
    "apps.media",
    "apps.analytics",
    "apps.sports",
]

# Media provider: "cloudinary" (default) or "r2" (Cloudflare R2).
MEDIA_PROVIDER = config("MEDIA_PROVIDER", default="cloudinary")

if MEDIA_PROVIDER == "r2":
    INSTALLED_APPS = INSTALLED_APPS + ["storages"]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "core.middleware.SecurityHeadersMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

DATABASE_URL = config("DATABASE_URL", default="")
SPORTS_DATABASE_URL = config("SPORTS_DATABASE_URL", default="")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600, conn_health_checks=True)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

if SPORTS_DATABASE_URL:
    DATABASES["sports"] = dj_database_url.parse(SPORTS_DATABASE_URL, conn_max_age=600, conn_health_checks=True)
    DATABASE_ROUTERS = ["core.db_router.SportsDatabaseRouter"]
else:
    DATABASES["sports"] = DATABASES["default"]

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Lagos"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"

STORAGES = {
    "default": {
        "BACKEND": "core.storage.MixedMediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config("CLOUDINARY_CLOUD_NAME", default=""),
    "API_KEY": config("CLOUDINARY_API_KEY", default=""),
    "API_SECRET": config("CLOUDINARY_API_SECRET", default=""),
}

# Cloudflare R2 (S3-compatible). Only used when MEDIA_PROVIDER == "r2".
# django-storages' S3Storage reads these global AWS_* settings.
if MEDIA_PROVIDER == "r2":
    AWS_ACCESS_KEY_ID = config("R2_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = config("R2_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = config("R2_BUCKET_NAME")
    AWS_S3_ENDPOINT_URL = f"https://{config('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com"
    AWS_S3_REGION_NAME = "auto"
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    # R2 does not support S3 ACLs — bucket is made public via the Cloudflare dashboard.
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_FILE_OVERWRITE = False
    # Optional public custom domain (e.g. media.solakuti.com). Falls back to the
    # bucket's r2.dev URL when unset.
    AWS_S3_CUSTOM_DOMAIN = config("R2_CUSTOM_DOMAIN", default="") or None
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "public, max-age=31536000, immutable"}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "solakuti-api-cache",
        "TIMEOUT": config("CACHE_DEFAULT_TIMEOUT", default=60, cast=int),
        "OPTIONS": {
            "MAX_ENTRIES": config("CACHE_MAX_ENTRIES", default=1000, cast=int),
        },
    }
}

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000,http://127.0.0.1:3000",
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:3000,http://127.0.0.1:3000",
    cast=Csv(),
)

DATA_UPLOAD_MAX_MEMORY_SIZE = config("DATA_UPLOAD_MAX_MEMORY_SIZE", default=50 * 1024 * 1024, cast=int)
FILE_UPLOAD_MAX_MEMORY_SIZE = config("FILE_UPLOAD_MAX_MEMORY_SIZE", default=50 * 1024 * 1024, cast=int)

SPORTS_PROVIDER = config("SPORTS_PROVIDER", default="api_football")
API_FOOTBALL_API_KEY = config("API_FOOTBALL_API_KEY", default="")
API_FOOTBALL_BASE_URL = config("API_FOOTBALL_BASE_URL", default="https://v3.football.api-sports.io")
API_FOOTBALL_COMPETITIONS = config("API_FOOTBALL_COMPETITIONS", default="PL,CL,UEL,BL1,DED,BSA,PD,FL1,ELC,PPL,EC,SA,WC,NPFL", cast=Csv())
API_FOOTBALL_SEASON = config("API_FOOTBALL_SEASON", default="", cast=lambda value: int(value) if str(value).strip() else None)
API_FOOTBALL_SYNC_DETAILS = config("API_FOOTBALL_SYNC_DETAILS", default=True, cast=bool)
API_FOOTBALL_TIMEOUT_SECONDS = config("API_FOOTBALL_TIMEOUT_SECONDS", default=35, cast=int)
API_FOOTBALL_MAX_ATTEMPTS = config("API_FOOTBALL_MAX_ATTEMPTS", default=3, cast=int)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardResultsSetPagination",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "120/hour",
        "user": "1000/hour",
        "auth": "10/min",
        "comments": "20/hour",
        "newsletter": "10/hour",
        "password_reset": "5/hour",
        "uploads": "30/hour",
    },
    "EXCEPTION_HANDLER": "core.responses.custom_exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config("ACCESS_TOKEN_LIFETIME_MINUTES", default=30, cast=int)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=config("REFRESH_TOKEN_LIFETIME_DAYS", default=7, cast=int)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Solakuti Newsroom API",
    "DESCRIPTION": "Modern scalable backend API for Solakuti, a premium Nigerian media platform.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=0 if DEBUG else 31536000, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", False)
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", False)
REFERRER_POLICY = "strict-origin-when-cross-origin"
CONTENT_SECURITY_POLICY = config("CONTENT_SECURITY_POLICY", default="")
X_FRAME_OPTIONS = "DENY"
