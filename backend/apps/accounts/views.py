from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import filters, generics, parsers, permissions, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.models import JournalistInvite, User
from apps.accounts.serializers import (
    AdminUserSerializer,
    InviteAcceptSerializer,
    JournalistApplicationSerializer,
    JournalistInviteSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    SolakutiTokenObtainPairSerializer,
    UserSerializer,
)
from apps.analytics.models import ActivityLog, LoginAttempt
from apps.analytics.utils import get_client_ip, log_activity
from core.permissions import IsAdmin, IsEditorialStaffOrReadOnly
from core.responses import ApiResponseMixin, api_response
from core.uploads import save_with_storage_guard


class RegisterView(generics.CreateAPIView):
    """Reader signup, used for commenting. Cannot grant publishing rights."""

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


class JournalistApplicationView(generics.CreateAPIView):
    """Public application to write for Solakuti. Creates a pending, unverified account."""

    serializer_class = JournalistApplicationSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = save_with_storage_guard(serializer)
        return api_response(
            data=UserSerializer(user, context=self.get_serializer_context()).data,
            message=(
                "Application received. An editor will review your profile before you can "
                "publish under your byline."
            ),
            status_code=status.HTTP_201_CREATED,
        )


class InviteVerifyView(views.APIView):
    """Validates an invite token so the join page can show who it is for."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    def get(self, request):
        token = request.query_params.get("token", "")
        invite = JournalistInvite.objects.filter(token=token).first()
        if not invite or not invite.is_pending:
            return api_response(
                None,
                message="This invitation link is invalid, expired or has already been used.",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        return api_response(
            {"email": invite.email, "role": invite.role},
            message="Invitation is valid.",
        )


class InviteAcceptView(generics.CreateAPIView):
    """Redeems an invite token and creates the verified journalist account."""

    serializer_class = InviteAcceptSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = save_with_storage_guard(serializer)
        return api_response(
            data=UserSerializer(user, context=self.get_serializer_context()).data,
            message="Welcome to the Solakuti newsroom. You can now sign in.",
            status_code=status.HTTP_201_CREATED,
        )


class JournalistInviteViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    """Editor/admin management of journalist invitations."""

    serializer_class = JournalistInviteSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorialStaffOrReadOnly]
    queryset = JournalistInvite.objects.select_related("invited_by", "accepted_user")
    http_method_names = ["get", "post", "delete", "head", "options"]
    success_message = "Invitations fetched successfully."

    def perform_create(self, serializer):
        serializer.save(
            token=JournalistInvite.generate_token(),
            invited_by=self.request.user,
        )

    def perform_destroy(self, instance):
        # Revoke rather than delete so the audit trail survives.
        if instance.accepted_at:
            raise ValidationError({"detail": "An accepted invitation cannot be revoked."})
        instance.revoked_at = timezone.now()
        instance.save(update_fields=["revoked_at"])


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

    @action(detail=False, methods=["get"], url_path="pending")
    def pending(self, request):
        """Byline applicants awaiting editorial review (excludes ordinary readers)."""
        queryset = User.objects.filter(
            journalist_application_at__isnull=False,
            is_verified=False,
            is_active=True,
        ).order_by("-journalist_application_at")
        return api_response(
            AdminUserSerializer(queryset, many=True, context=self.get_serializer_context()).data,
            message="Pending applications fetched successfully.",
        )

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        """Verify an applicant and promote them to a publishing byline."""
        user = self.get_object()
        role = request.data.get("role", User.Role.JOURNALIST)
        if role == User.Role.ADMIN:
            raise ValidationError({"detail": "Admin cannot be granted through application approval."})
        user.role = role
        user.is_verified = True
        user.save(update_fields=["role", "is_verified"])
        log_activity(request, ActivityLog.Action.UPDATED, "user", f"Approved journalist: {user.email}", object_id=user.pk)
        return api_response(
            AdminUserSerializer(user, context=self.get_serializer_context()).data,
            message=f"{user.full_name} approved as {user.get_role_display()}.",
        )

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        """Decline an applicant without deleting the audit trail."""
        user = self.get_object()
        if user.is_verified:
            raise ValidationError({"detail": "This account is already approved."})
        user.is_active = False
        user.save(update_fields=["is_active"])
        log_activity(request, ActivityLog.Action.UPDATED, "user", f"Rejected application: {user.email}", object_id=user.pk)
        return api_response(None, message="Application declined.")
