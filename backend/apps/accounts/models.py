import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

# How long a journalist invite link stays valid.
INVITE_VALID_DAYS = 14


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("full_name", "Solakuti Admin")
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        EDITOR = "editor", "Editor"
        JOURNALIST = "journalist", "Journalist"
        CONTRIBUTOR = "contributor", "Contributor"

    full_name = models.CharField(max_length=180)
    email = models.EmailField(unique=True, db_index=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    bio = models.TextField(blank=True)
    # Public author identity signals — surfaced on author pages so readers and
    # search engines can verify the journalist is a real, attributable person.
    x_handle = models.CharField(max_length=50, blank=True)
    linkedin_url = models.URLField(blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CONTRIBUTOR, db_index=True)
    is_verified = models.BooleanField(default=False)
    # Set when someone applies for a byline, distinguishing journalist applicants
    # from ordinary readers who registered only to comment.
    journalist_application_at = models.DateTimeField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        ordering = ["full_name"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role", "is_verified"]),
        ]

    def __str__(self):
        return self.full_name or self.email

    @property
    def can_publish(self):
        """Only verified editorial staff may appear as a byline."""
        return self.is_verified and self.role in {
            User.Role.ADMIN,
            User.Role.EDITOR,
            User.Role.JOURNALIST,
        }


def _default_invite_expiry():
    return timezone.now() + timedelta(days=INVITE_VALID_DAYS)


class JournalistInvite(models.Model):
    """A single-use invitation allowing a named journalist to create an account."""

    email = models.EmailField(db_index=True)
    role = models.CharField(
        max_length=20,
        choices=User.Role.choices,
        default=User.Role.JOURNALIST,
    )
    token = models.CharField(max_length=64, unique=True, db_index=True)
    invited_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_invites",
    )
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=_default_invite_expiry)
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted_user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accepted_invite",
    )
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["token"]), models.Index(fields=["email"])]

    def __str__(self):
        return f"Invite for {self.email} ({self.role})"

    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    @property
    def is_pending(self):
        return not self.accepted_at and not self.revoked_at and not self.is_expired

    @property
    def status(self):
        if self.accepted_at:
            return "accepted"
        if self.revoked_at:
            return "revoked"
        if self.is_expired:
            return "expired"
        return "pending"
