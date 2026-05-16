from django.conf import settings


class SecurityHeadersMiddleware:
    """Add defense-in-depth headers for API, admin, and documentation responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.setdefault("X-Content-Type-Options", "nosniff")
        response.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()")
        response.setdefault("Cross-Origin-Opener-Policy", "same-origin")

        content_security_policy = getattr(settings, "CONTENT_SECURITY_POLICY", "")
        if content_security_policy:
            response.setdefault("Content-Security-Policy", content_security_policy)

        return response
