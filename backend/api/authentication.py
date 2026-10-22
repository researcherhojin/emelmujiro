from django.conf import settings
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


def enforce_csrf(request):
    """Apply Django's origin and token checks to ambient cookie credentials."""
    SessionAuthentication().enforce_csrf(request)


class CookieJWTAuthentication(JWTAuthentication):
    """JWT authentication that reads tokens from httpOnly cookies,
    falling back to the Authorization header."""

    def authenticate(self, request):
        # Try cookie first
        raw_token = request.COOKIES.get(settings.JWT_ACCESS_COOKIE)
        if raw_token:
            try:
                validated_token = self.get_validated_token(raw_token)
                user = self.get_user(validated_token)
                enforce_csrf(request)
                return user, validated_token
            except (InvalidToken, TokenError):
                pass

        # Fall back to Authorization header
        return super().authenticate(request)
