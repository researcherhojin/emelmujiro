import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from .serializers import UserSerializer

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


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    User registration endpoint
    """
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    password_confirm = request.data.get("password_confirm")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")

    # Validation
    if not username or not email or not password:
        return Response({"error": "Username, email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    if password != password_confirm:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 12:
        return Response({"error": "Password must be at least 12 characters"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    # Create user
    user = User.objects.create_user(
        username=username, email=email, password=password, first_name=first_name, last_name=last_name
    )

    # Generate tokens
    refresh = RefreshToken.for_user(user)

    response = Response(
        {"refresh": str(refresh), "access": str(refresh.access_token), "user": UserSerializer(user).data},
        status=status.HTTP_201_CREATED,
    )
    _set_jwt_cookies(response, refresh.access_token, refresh)
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    User login endpoint
    """
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

    response = Response(
        {"refresh": str(refresh), "access": str(refresh.access_token), "user": UserSerializer(user).data}
    )
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
    except Exception as e:
        logger.error(f"Logout error: {e}")
        response = Response({"error": "Logout failed"}, status=status.HTTP_400_BAD_REQUEST)
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

    response = Response(
        {"success": "Password changed successfully", "refresh": str(refresh), "access": str(refresh.access_token)}
    )
    _set_jwt_cookies(response, refresh.access_token, refresh)
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh(request):
    """
    Refresh JWT token - reads from cookie or request body.
    """
    refresh_token = request.data.get("refresh") or request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
    if not refresh_token:
        return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        old_refresh = RefreshToken(refresh_token)
        # Get new access token
        access_token = old_refresh.access_token

        # If rotation is enabled, create new refresh token
        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION"):
                old_refresh.blacklist()
            new_refresh = RefreshToken.for_user(
                User.objects.get(id=old_refresh["user_id"])
            )
            response = Response({"access": str(access_token), "refresh": str(new_refresh)})
            _set_jwt_cookies(response, new_refresh.access_token, new_refresh)
        else:
            response = Response({"access": str(access_token), "refresh": str(refresh_token)})
            _set_jwt_cookies(response, access_token, old_refresh)

        return response

    except (InvalidToken, TokenError) as e:
        logger.error(f"Token refresh error: {e}")
        response = Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        _clear_jwt_cookies(response)
        return response
