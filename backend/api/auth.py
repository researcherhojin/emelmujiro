import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
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
from .serializers import (
    LoginSerializer,
    PasswordChangeSerializer,
    ProfileUpdateSerializer,
    RefreshInputSerializer,
    UserSerializer,
)
from .login_throttle import LoginRateThrottle

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
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]

    # Try to authenticate with username or email
    user = None
    if "@" in username:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            # Ambiguous email addresses must never select an arbitrary account.
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
@authentication_classes([])
@permission_classes([AllowAny])
def logout(request):
    """
    User logout endpoint (blacklist refresh token)
    """
    enforce_csrf(request)
    serializer = RefreshInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        # Revoke the browser cookie first, even when a body token is supplied.
        refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE) or serializer.validated_data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            response = Response({"success": "Logged out successfully"})
            _clear_jwt_cookies(response)
            return response
        else:
            response = Response({"success": "Logged out successfully"})
            _clear_jwt_cookies(response)
            return response
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

    serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(UserSerializer(user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    user = request.user
    serializer = PasswordChangeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    old_password = serializer.validated_data["old_password"]
    new_password = serializer.validated_data["new_password"]

    if not user.check_password(old_password):
        return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 12:
        return Response({"error": "Password must be at least 12 characters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user=user)
    except ValidationError as exc:
        return Response({"error": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

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
    serializer = RefreshInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    refresh_token = serializer.validated_data.get("refresh") or request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
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
