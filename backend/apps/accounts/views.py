from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.models import User
from apps.accounts.serializers import AdminUserSerializer, RegisterSerializer, SolakutiTokenObtainPairSerializer, UserSerializer
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


class RefreshTokenView(ApiResponseMixin, TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"
    success_message = "Token refreshed successfully."


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
