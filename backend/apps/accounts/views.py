from rest_framework import generics, permissions, status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.serializers import RegisterSerializer, SolakutiTokenObtainPairSerializer, UserSerializer
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
