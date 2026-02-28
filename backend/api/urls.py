from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    BlogPostViewSet,
    ContactView,
    NewsletterView,
    health_check,
    CategoryListView,
    send_test_email,
)
from .auth import (
    register,
    login,
    logout,
    get_user,
    update_user,
    change_password,
)
from .swagger import schema_view

router = DefaultRouter()
router.register(r"blog-posts", BlogPostViewSet, basename="blog-posts")

urlpatterns = [
    # API endpoints
    path("", include(router.urls)),
    # Contact and Newsletter
    path("contact/", ContactView.as_view(), name="contact-create"),
    path("newsletter/", NewsletterView.as_view(), name="newsletter-subscribe"),
    # Categories
    path("categories/", CategoryListView.as_view(), name="category-list"),
    # Health check
    path("health/", health_check, name="health-check"),
    # Test email (debug only)
    path("send-test-email/", send_test_email, name="send-test-email"),
    # Authentication endpoints
    path("auth/register/", register, name="register"),
    path("auth/login/", login, name="login"),
    path("auth/logout/", logout, name="logout"),
    path("auth/user/", get_user, name="get_user"),
    path("auth/user/update/", update_user, name="update_user"),
    path("auth/change-password/", change_password, name="change_password"),
    # JWT token endpoints
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # API Documentation
    path(
        "docs/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("schema/", schema_view.without_ui(cache_timeout=0), name="schema-json"),
]
