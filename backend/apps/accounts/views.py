from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import filters, generics, permissions, status, views, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.models import User
from apps.accounts.serializers import (
    AdminUserSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    SolakutiTokenObtainPairSerializer,
    UserSerializer,
)
from apps.analytics.models import ActivityLog, LoginAttempt
from apps.analytics.utils import get_client_ip, log_activity
from core.permissions import IsAdmin
from core.responses import ApiResponseMixin, api_response


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return api_response(
            data=UserSerializer(user, context=self.get_serializer_context()).data,
            message="Account created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(ApiResponseMixin, TokenObtainPairView):
    serializer_class = SolakutiTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"
    success_message = "Login successful."

    def post(self, request, *args, **kwargs):
        email = str(request.data.get("email", "")).strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        try:
            response = super().post(request, *args, **kwargs)
        except Exception:
            LoginAttempt.objects.create(
                email=email,
                user=None,
                success=False,
                ip_address=get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
            raise

        LoginAttempt.objects.create(
            email=email,
            user=user,
            success=True,
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
        )
        if user:
            log_activity(request, ActivityLog.Action.LOGIN, "auth", f"Login: {user.email}", object_id=user.pk)
        return response


class RefreshTokenView(ApiResponseMixin, TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"
    success_message = "Token refreshed successfully."


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return api_response(None, message="Refresh token is required.", success=False, status_code=400)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return api_response(None, message="Could not sign out this session.", success=False, status_code=400)
        log_activity(request, ActivityLog.Action.LOGOUT, "auth", f"Logout: {request.user.email}", object_id=request.user.pk)
        return api_response(None, message="Signed out successfully.")


class PasswordResetRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "password_reset"
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        data = {}
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{getattr(settings, 'FRONTEND_URL', '').rstrip('/')}/admin?reset_uid={uid}&reset_token={token}"
            # Email delivery can be wired to a provider later; do not expose tokens in production.
            if settings.DEBUG:
                data = {"uid": uid, "token": token, "reset_url": reset_url}
        return api_response(data, message="If the account exists, password reset instructions have been prepared.")


class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "password_reset"
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=user_id, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError):
            return api_response(None, message="Invalid password reset link.", success=False, status_code=400)

        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return api_response(None, message="Invalid or expired password reset link.", success=False, status_code=400)

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return api_response(None, message="Password reset successfully.")


class ProfileView(ApiResponseMixin, generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    success_message = "Profile fetched successfully."

    def get_object(self):
        return self.request.user


class UserAdminViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "email", "bio", "role"]
    ordering_fields = ["full_name", "email", "role", "date_joined"]
    ordering = ["full_name"]
    success_message = "Users fetched successfully."

    def get_queryset(self):
        return User.objects.all()

    def perform_create(self, serializer):
        user = serializer.save()
        log_activity(self.request, ActivityLog.Action.CREATED, "user", f"Created user: {user.email}", object_id=user.pk)

    def perform_update(self, serializer):
        user = serializer.save()
        log_activity(self.request, ActivityLog.Action.UPDATED, "user", f"Updated user: {user.email}", object_id=user.pk)

    def perform_destroy(self, instance):
        log_activity(self.request, ActivityLog.Action.DELETED, "user", f"Deleted user: {instance.email}", object_id=instance.pk)
        instance.delete()
