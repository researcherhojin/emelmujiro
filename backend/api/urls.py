from django.conf import settings
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenVerifyView,
)
from .views import (
    BlogPostViewSet,
    ContactView,
    NewsletterView,
    NotificationViewSet,
    health_check,
    CategoryListView,
    send_test_email,
)
from .admin_views import (
    admin_stats,
    admin_content,
    admin_messages,
    admin_message_detail,
    admin_users,
    admin_user_detail,
    admin_analytics_visits,
    admin_analytics_pages,
)
from .auth import (
    register,
    login,
    logout,
    get_user,
    update_user,
    change_password,
    token_refresh,
)
from .swagger import schema_view

router = DefaultRouter()
router.register(r"blog-posts", BlogPostViewSet, basename="blog")
router.register(r"notifications", NotificationViewSet, basename="notification")

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
    # Admin endpoints
    path("admin/stats/", admin_stats, name="admin-stats"),
    path("admin/content/", admin_content, name="admin-content"),
    path("admin/messages/", admin_messages, name="admin-messages"),
    path("admin/messages/<uuid:pk>/", admin_message_detail, name="admin-message-detail"),
    path("admin/users/", admin_users, name="admin-users"),
    path("admin/users/<int:pk>/", admin_user_detail, name="admin-user-detail"),
    path("admin/analytics/visits/", admin_analytics_visits, name="admin-analytics-visits"),
    path("admin/analytics/pages/", admin_analytics_pages, name="admin-analytics-pages"),
    # Authentication endpoints
    path("auth/register/", register, name="register"),
    path("auth/login/", login, name="login"),
    path("auth/logout/", logout, name="logout"),
    path("auth/user/", get_user, name="get_user"),
    path("auth/user/update/", update_user, name="update_user"),
    path("auth/change-password/", change_password, name="change_password"),
    # JWT token endpoints
    path("auth/token/refresh/", token_refresh, name="token_refresh"),
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

if settings.DEBUG:
    urlpatterns += [
        path("send-test-email/", send_test_email, name="send-test-email"),
    ]
