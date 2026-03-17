from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """JWT authentication that reads tokens from httpOnly cookies,
    falling back to the Authorization header."""

    def authenticate(self, request):
        # Try cookie first
        raw_token = request.COOKIES.get(settings.JWT_ACCESS_COOKIE)
        if raw_token:
            try:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token
            except (InvalidToken, TokenError):
                pass

        # Fall back to Authorization header
        return super().authenticate(request)
