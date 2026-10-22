import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import DatabaseError
from django.middleware.csrf import get_token
from django.utils.crypto import constant_time_compare
from django.views.decorators.cache import never_cache
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.utils import get_md5_hash_password

from .authentication import enforce_csrf
from .serializers import UserSerializer
from .throttling import ClientIPAnonRateThrottle

logger = logging.getLogger(__name__)


def _set_jwt_cookies(response, access_token, refresh_token):
    """Set JWT tokens as httpOnly cookies on the response."""
    response.set_cookie(
        settings.JWT_ACCESS_COOKIE,
        str(access_token),
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path="/",
    )
    response.set_cookie(
        settings.JWT_REFRESH_COOKIE,
        str(refresh_token),
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path="/",
    )


def _clear_jwt_cookies(response):
    """Clear JWT cookies from the response."""
    response.delete_cookie(settings.JWT_ACCESS_COOKIE, path="/")
    response.delete_cookie(settings.JWT_REFRESH_COOKIE, path="/")


class LoginRateThrottle(ClientIPAnonRateThrottle):
    """Dedicated brute-force throttle for the login endpoint (per-IP)."""

    scope = "login"


@never_cache
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([])
def csrf_token(request):
    """Return a masked token; the security middleware still limits requests."""
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login(request):
    """
    User login endpoint
    """
    enforce_csrf(request)
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Try to authenticate with username or email
    user = None
    if "@" in username:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    else:
        user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    # Generate tokens
    refresh = RefreshToken.for_user(user)

    response = Response({"user": UserSerializer(user).data})
    _set_jwt_cookies(response, refresh.access_token, refresh)
    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    User logout endpoint (blacklist refresh token)
    """
    try:
        # Try refresh token from request body first, then cookie
        refresh_token = request.data.get("refresh") or request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            response = Response({"success": "Logged out successfully"})
            _clear_jwt_cookies(response)
            return response
        else:
            return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
    except (InvalidToken, TokenError) as e:
        logger.error(f"Logout error: {e}")
        response = Response({"error": "Logout failed"}, status=status.HTTP_400_BAD_REQUEST)
        _clear_jwt_cookies(response)
        return response
    except DatabaseError:
        logger.exception("Logout token revocation failed")
        response = Response({"error": "Logout unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        _clear_jwt_cookies(response)
        return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user(request):
    """
    Get current user information
    """
    return Response(UserSerializer(request.user).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request):
    """
    Update user information
    """
    user = request.user

    # Update allowed fields
    if "first_name" in request.data:
        user.first_name = request.data["first_name"]
    if "last_name" in request.data:
        user.last_name = request.data["last_name"]
    if "email" in request.data:
        # Check if email is already taken
        if User.objects.filter(email=request.data["email"]).exclude(id=user.id).exists():
            return Response({"error": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)
        user.email = request.data["email"]

    user.save()

    return Response(UserSerializer(user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response({"error": "Both old and new passwords are required"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 12:
        return Response({"error": "Password must be at least 12 characters"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    # Generate new tokens
    refresh = RefreshToken.for_user(user)

    response = Response({"success": "Password changed successfully"})
    _set_jwt_cookies(response, refresh.access_token, refresh)
    return response


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def token_refresh(request):
    """
    Refresh JWT token - reads from cookie or request body.
    """
    # Both input forms issue cookies, so a caller-supplied token must not bypass
    # CSRF and sign a browser into an attacker-controlled account.
    enforce_csrf(request)
    refresh_token = request.data.get("refresh") or request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
    if not refresh_token:
        return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        old_refresh = RefreshToken(refresh_token)
        user = User.objects.get(id=old_refresh[api_settings.USER_ID_CLAIM])
        if not user.is_active:
            raise TokenError("User is inactive")
        if api_settings.CHECK_REVOKE_TOKEN and not constant_time_compare(
            old_refresh.get(api_settings.REVOKE_TOKEN_CLAIM, ""), get_md5_hash_password(user.password)
        ):
            raise TokenError("Password has changed")
        # Get new access token
        access_token = old_refresh.access_token

        # If rotation is enabled, create new refresh token
        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION"):
                old_refresh.blacklist()
            new_refresh = RefreshToken.for_user(user)
            response = Response({"success": "Token refreshed"})
            _set_jwt_cookies(response, new_refresh.access_token, new_refresh)
        else:
            response = Response({"success": "Token refreshed"})
            _set_jwt_cookies(response, access_token, old_refresh)

        return response

    except (InvalidToken, TokenError, User.DoesNotExist) as e:
        logger.error(f"Token refresh error: {e}")
        response = Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        _clear_jwt_cookies(response)
        return response
