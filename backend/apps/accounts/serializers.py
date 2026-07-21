from django.conf import settings
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_spectacular.utils import OpenApiTypes, extend_schema_field

from apps.accounts.models import JournalistInvite, User

# A real byline needs a substantive bio — short filler defeats the purpose.
MIN_BIO_LENGTH = 80


class UserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "profile_image",
            "profile_image_url",
            "bio",
            "x_handle",
            "linkedin_url",
            "role",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "role", "is_verified", "date_joined", "profile_image_url"]

    @extend_schema_field(OpenApiTypes.URI)
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        return None


class AdminUserSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ["is_active", "is_staff", "password"]
        read_only_fields = ["id", "date_joined", "profile_image_url"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Reader signup (used for commenting). Creates an unverified contributor
    who can comment but never publish — publishing requires editorial roles."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        validate_password(password)
        validated_data["role"] = User.Role.CONTRIBUTOR
        validated_data["is_verified"] = False
        return User.objects.create_user(password=password, **validated_data)


class BaseJournalistProfileSerializer(serializers.ModelSerializer):
    """Shared validation guaranteeing every byline is a real, attributable person."""

    password = serializers.CharField(write_only=True, min_length=8)

    def validate_full_name(self, value):
        value = " ".join((value or "").split())
        if len([part for part in value.split(" ") if part]) < 2:
            raise serializers.ValidationError("Enter your real first and last name.")
        return value

    def validate_bio(self, value):
        value = (value or "").strip()
        if len(value) < MIN_BIO_LENGTH:
            raise serializers.ValidationError(
                f"Your bio must be at least {MIN_BIO_LENGTH} characters. Describe your "
                "reporting background and the subjects you cover."
            )
        return value

    def validate_password(self, value):
        validate_password(value)
        return value


class JournalistApplicationSerializer(BaseJournalistProfileSerializer):
    """Public application. Creates an unverified contributor pending editor review."""

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "password",
            "bio",
            "profile_image",
            "x_handle",
            "linkedin_url",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "bio": {"required": True},
            "profile_image": {"required": True, "allow_null": False},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Applicants cannot publish until an editor approves and promotes them.
        validated_data["role"] = User.Role.CONTRIBUTOR
        validated_data["is_verified"] = False
        validated_data["journalist_application_at"] = timezone.now()
        return User.objects.create_user(password=password, **validated_data)


class InviteAcceptSerializer(BaseJournalistProfileSerializer):
    """Redeems an invite token, creating a verified journalist account."""

    token = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "token",
            "full_name",
            "password",
            "bio",
            "profile_image",
            "x_handle",
            "linkedin_url",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "bio": {"required": True},
            "profile_image": {"required": True, "allow_null": False},
        }

    def validate_token(self, value):
        invite = JournalistInvite.objects.filter(token=value).first()
        if not invite or not invite.is_pending:
            raise serializers.ValidationError(
                "This invitation link is invalid, expired or has already been used."
            )
        if User.objects.filter(email__iexact=invite.email).exists():
            raise serializers.ValidationError("An account already exists for this email.")
        self.context["invite"] = invite
        return value

    def create(self, validated_data):
        validated_data.pop("token")
        invite = self.context["invite"]
        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=invite.email,
            password=password,
            role=invite.role,
            is_verified=True,
            **validated_data,
        )
        invite.accepted_at = timezone.now()
        invite.accepted_user = user
        invite.save(update_fields=["accepted_at", "accepted_user"])
        return user


class JournalistInviteSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    invite_url = serializers.SerializerMethodField()
    invited_by_name = serializers.CharField(source="invited_by.full_name", read_only=True)

    class Meta:
        model = JournalistInvite
        fields = [
            "id",
            "email",
            "role",
            "note",
            "status",
            "invite_url",
            "invited_by_name",
            "created_at",
            "expires_at",
            "accepted_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "invite_url",
            "invited_by_name",
            "created_at",
            "expires_at",
            "accepted_at",
        ]

    @extend_schema_field(OpenApiTypes.URI)
    def get_invite_url(self, obj):
        base = getattr(settings, "FRONTEND_URL", "").rstrip("/")
        return f"{base}/join?token={obj.token}"

    def validate_role(self, value):
        # Admin accounts are never created through an invite link.
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Admin accounts cannot be created by invitation.")
        return value

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account already exists for this email.")
        # Must mirror JournalistInvite.is_pending. Without the expiry check an
        # expired invite would block re-inviting while being unusable itself.
        if JournalistInvite.objects.filter(
            email__iexact=value,
            accepted_at__isnull=True,
            revoked_at__isnull=True,
            expires_at__gt=timezone.now(),
        ).exists():
            raise serializers.ValidationError("A pending invite already exists for this email.")
        return value


class SolakutiTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user, context=self.context).data
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value
