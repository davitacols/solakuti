from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    InviteAcceptView,
    InviteVerifyView,
    JournalistApplicationView,
    JournalistInviteViewSet,
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProfileView,
    RefreshTokenView,
    RegisterView,
)

router = DefaultRouter()
router.register("invites", JournalistInviteViewSet, basename="journalist-invite")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("apply/", JournalistApplicationView.as_view(), name="journalist-apply"),
    path("invite/verify/", InviteVerifyView.as_view(), name="invite-verify"),
    path("invite/accept/", InviteAcceptView.as_view(), name="invite-accept"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", RefreshTokenView.as_view(), name="token-refresh"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("", include(router.urls)),
]
