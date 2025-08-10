"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api.views import (
    BlogPostViewSet,
    CategoryListView,
    ContactView,
    NewsletterView,
    health_check,
    send_test_email,
)

router = DefaultRouter()
router.register(r"blog-posts", BlogPostViewSet, basename="blog-post")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),  # Include all API URLs from api app
    path("api/categories/", CategoryListView.as_view(), name="category-list"),
    path("api/contact/", ContactView.as_view(), name="contact"),
    path("api/newsletter/", NewsletterView.as_view(), name="newsletter"),
    path("api/health/", health_check, name="health-check"),
    path("api/send-test-email/", send_test_email, name="send-test-email"),
]

# 개발 환경에서 미디어 파일 서빙
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
