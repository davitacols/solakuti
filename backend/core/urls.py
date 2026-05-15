from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.accounts.views import UserAdminViewSet
from apps.analytics.views import AnalyticsOverviewView
from apps.categories.views import CategoryViewSet
from apps.media.views import MediaAssetViewSet
from apps.news.views import ArticleViewSet, CommentViewSet, SearchView

admin.site.site_header = "Solakuti Newsroom Admin"
admin.site.site_title = "Solakuti Admin"
admin.site.index_title = "Editorial Operations"

router = DefaultRouter()
router.register("articles", ArticleViewSet, basename="article")
router.register("categories", CategoryViewSet, basename="category")
router.register("comments", CommentViewSet, basename="comment")
router.register("media", MediaAssetViewSet, basename="media")
router.register("users", UserAdminViewSet, basename="user")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/search/", SearchView.as_view(), name="search"),
    path("api/analytics/overview/", AnalyticsOverviewView.as_view(), name="analytics-overview"),
    path("api/", include(router.urls)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
