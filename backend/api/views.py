from rest_framework import viewsets, status, mixins
from rest_framework.views import APIView
from rest_framework.decorators import api_view, throttle_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from django.db.models import Q, F, Count
from django.utils import timezone
from django.core.cache import cache
from django.http import HttpRequest
from django.core.validators import validate_email
from django.core.exceptions import ImproperlyConfigured, ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError
from datetime import timedelta
import hashlib
import ipaddress
import logging
import os
import re
import uuid as uuid_mod

from .constants import ONE_DAY, ONE_HOUR, is_spam

import requests

from .models import (
    BlogPost,
    BlogLike,
    BlogComment,
    CommentLike,
    Contact,
    ContactAttempt,
    Notification,
    NotificationPreference,
    SiteVisit,
    NewsletterSubscription,
)
from .serializers import (
    BlogPostSerializer,
    BlogPostWriteSerializer,
    BlogCommentSerializer,
    ContactSerializer,
    NotificationPreferenceSerializer,
    NotificationSerializer,
    NewsletterSubscriptionSerializer,
)

logger = logging.getLogger(__name__)


class ContactRateThrottle(AnonRateThrottle):
    """Contact form rate throttle"""

    scope = "contact"
    rate = "5/hour"


class CommentRateThrottle(AnonRateThrottle):
    """Comment creation rate throttle"""

    scope = "comment"
    rate = "10/hour"


class AdminRateThrottle(UserRateThrottle):
    """Admin endpoint rate throttle"""

    scope = "admin"
    rate = "120/hour"


def get_client_ip(request: HttpRequest) -> str:
    """Extract client IP address (security-hardened)"""
    # Check proxy headers in priority order
    headers = [
        "HTTP_CF_CONNECTING_IP",  # Cloudflare
        "HTTP_X_REAL_IP",  # Nginx
        "HTTP_X_FORWARDED_FOR",  # Standard proxy header
        "HTTP_X_FORWARDED",  # Alternative
        "HTTP_X_CLUSTER_CLIENT_IP",
        "HTTP_FORWARDED_FOR",
        "HTTP_FORWARDED",
        "REMOTE_ADDR",
    ]

    for header in headers:
        value = request.META.get(header)
        if value:
            # For X-Forwarded-For, use only the first IP
            if "FORWARDED" in header:
                ip = value.split(",")[0].strip()
            else:
                ip = value.strip()

            # Validate IP format
            if _is_valid_ip(ip):
                return ip

    return "127.0.0.1"  # Fallback


def _is_valid_ip(ip: str) -> bool:
    """Validate IP address format"""
    if not isinstance(ip, str):
        return False
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False


def verify_recaptcha(recaptcha_response: str, request_ip: str = None) -> bool:
    """Verify reCAPTCHA response (security-hardened)"""
    if not settings.RECAPTCHA_PRIVATE_KEY:
        if not settings.DEBUG:
            raise ImproperlyConfigured("RECAPTCHA_PRIVATE_KEY not configured in production")
        return True

    # Input validation
    if not recaptcha_response or len(recaptcha_response) > 1000:
        return False

    data = {"secret": settings.RECAPTCHA_PRIVATE_KEY, "response": recaptcha_response}

    # Add IP address (optional)
    if request_ip:
        data["remoteip"] = request_ip

    try:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data=data,
            timeout=10,
            headers={"User-Agent": "EmelmujiroBot/1.0"},
        )

        if response.status_code != 200:
            logger.error(f"reCAPTCHA API returned status {response.status_code}")
            return False

        result = response.json()
        success = result.get("success", False)

        # Log error codes
        if not success:
            error_codes = result.get("error-codes", [])
            logger.warning(f"reCAPTCHA failed with errors: {error_codes}")

        return success

    except requests.RequestException as e:
        logger.error(f"reCAPTCHA network error: {e}")
        return False
    except ValueError as e:
        logger.error(f"reCAPTCHA JSON decode error: {e}")
        return False
    except Exception as e:
        logger.error(f"reCAPTCHA verification failed: {e}")
        return False


def log_site_visit(request: HttpRequest):
    """Log site visit"""
    try:
        ip_address = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        referer = request.META.get("HTTP_REFERER", "")
        page_path = request.path
        session_id = request.session.session_key or ""

        SiteVisit.objects.create(
            ip_address=ip_address,
            user_agent=user_agent,
            referer=referer,
            page_path=page_path,
            session_id=session_id,
        )
    except Exception as e:
        logger.error(f"Failed to log site visit: {e}")


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve", "like"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return BlogPostWriteSerializer
        return BlogPostSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Admins see all posts (including drafts); public sees only published
        if not (self.request.user and self.request.user.is_staff):
            queryset = queryset.filter(is_published=True)

        category = self.request.query_params.get("category", None)
        search = self.request.query_params.get("search", None)
        featured = self.request.query_params.get("featured", None)

        if category:
            # Validate against known category choices
            valid_categories = [c[0] for c in BlogPost.CATEGORY_CHOICES]
            if category in valid_categories:
                queryset = queryset.filter(category=category)
        if search:
            # Limit search query length to prevent abuse
            search = search[:200]
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search) | Q(content__icontains=search)
            )
        if featured and featured.lower() == "true":
            queryset = queryset.filter(is_featured=True)

        return queryset

    def perform_create(self, serializer):
        author = self.request.user.get_full_name() or self.request.user.username
        serializer.save(author=author)
        cache.delete("blog_categories")
        cache.delete("blog_post_list")

    def perform_update(self, serializer):
        serializer.save()
        cache.delete("blog_categories")
        cache.delete("blog_post_list")

    def perform_destroy(self, instance):
        instance.delete()
        cache.delete("blog_categories")
        cache.delete("blog_post_list")

    def retrieve(self, request, *args, **kwargs):
        """Retrieve individual post with view count increment and visit log"""
        log_site_visit(request)

        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response = Response(serializer.data)

        # Increment view count (once per day per IP)
        ip_address = get_client_ip(request)
        cache_key = f"blog_view_{instance.id}_{hashlib.sha256(ip_address.encode()).hexdigest()[:16]}"

        if not cache.get(cache_key):
            BlogPost.objects.filter(id=instance.id).update(view_count=F("view_count") + 1)
            cache.set(cache_key, True, timeout=ONE_DAY)

        return response

    def list(self, request, *args, **kwargs):
        """List posts with visit log"""
        log_site_visit(request)

        # Cache unfiltered public list for 30 seconds
        is_public = not (request.user and request.user.is_staff)
        has_filters = any(request.query_params.get(p) for p in ("category", "search", "featured", "page"))
        if is_public and not has_filters:
            cache_key = "blog_post_list"
            cached = cache.get(cache_key)
            if cached is not None:
                return Response(cached)
            response = super().list(request, *args, **kwargs)
            cache.set(cache_key, response.data, timeout=30)
            return response

        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="toggle-publish")
    def toggle_publish(self, request, slug=None):
        """Toggle the is_published status of a blog post."""
        post = self.get_object()
        post.is_published = not post.is_published
        post.save(update_fields=["is_published", "updated_at"])
        cache.delete("blog_categories")
        cache.delete("blog_post_list")
        return Response({"id": post.id, "is_published": post.is_published})

    @action(detail=True, methods=["post"], url_path="like", permission_classes=[AllowAny])
    def like(self, request, slug=None):
        """Toggle like on a blog post (one per IP)."""
        post = self.get_object()
        ip_address = get_client_ip(request)

        like, created = BlogLike.objects.get_or_create(post=post, ip_address=ip_address)
        if created:
            BlogPost.objects.filter(id=post.id).update(likes=F("likes") + 1)
            post.refresh_from_db()
            return Response({"liked": True, "likes": post.likes})
        else:
            like.delete()
            BlogPost.objects.filter(id=post.id).update(likes=F("likes") - 1)
            post.refresh_from_db()
            return Response({"liked": False, "likes": post.likes})


class BlogCommentViewSet(viewsets.ModelViewSet):
    """CRUD for blog comments. Anyone can create/read; only admin can delete."""

    serializer_class = BlogCommentSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_throttles(self):
        if self.action == "create":
            return [CommentRateThrottle()]
        return []

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        post_id = self.kwargs.get("post_pk")
        return BlogComment.objects.filter(post_id=post_id, parent__isnull=True).prefetch_related(
            "replies", "comment_likes", "replies__comment_likes"
        )

    def perform_create(self, serializer):
        post_id = self.kwargs.get("post_pk")
        ip_address = get_client_ip(self.request)

        # Spam keyword check
        content = serializer.validated_data.get("content", "")
        if is_spam(content):
            raise ValidationError({"content": "스팸으로 의심되는 내용이 포함되어 있습니다."})

        serializer.save(post_id=post_id, ip_address=ip_address)

    @action(detail=True, methods=["post"], url_path="like")
    def like(self, request, post_pk=None, pk=None):
        """Toggle like on a comment (one per IP)."""
        comment = self.get_object()
        ip_address = get_client_ip(request)

        like, created = CommentLike.objects.get_or_create(comment=comment, ip_address=ip_address)
        if created:
            BlogComment.objects.filter(id=comment.id).update(likes=F("likes") + 1)
            comment.refresh_from_db()
            return Response({"liked": True, "likes": comment.likes})
        else:
            like.delete()
            BlogComment.objects.filter(id=comment.id).update(likes=F("likes") - 1)
            comment.refresh_from_db()
            return Response({"liked": False, "likes": comment.likes})


class BlogImageUploadView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        file = request.FILES.get("image")
        if not file:
            return Response({"error": "이미지 파일이 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        from .validators import validate_uploaded_file

        try:
            validate_uploaded_file(file)
        except (ValidationError, DjangoValidationError) as e:
            return Response(
                {"error": e.messages if hasattr(e, "messages") else str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

        # Save to media/blog/images/{year}/{month}/{filename}
        now = timezone.now()
        upload_dir = os.path.join(settings.MEDIA_ROOT, "blog", "images", str(now.year), f"{now.month:02d}")
        os.makedirs(upload_dir, exist_ok=True)

        ext = os.path.splitext(file.name)[1].lower()
        safe_name = f"{uuid_mod.uuid4().hex[:12]}{ext}"
        file_path = os.path.join(upload_dir, safe_name)

        with open(file_path, "wb+") as dest:
            for chunk in file.chunks():
                dest.write(chunk)

        relative_url = f"/media/blog/images/{now.year}/{now.month:02d}/{safe_name}"
        return Response({"url": relative_url}, status=status.HTTP_201_CREATED)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        log_site_visit(request)

        # Return cached category data if available
        cached = cache.get("blog_categories")
        if cached is not None:
            return Response(cached)

        categories = (
            BlogPost.objects.filter(is_published=True)
            .values("category")
            .annotate(count=Count("category"))
            .order_by("category")
        )

        category_data = []
        category_choices_dict = dict(BlogPost.CATEGORY_CHOICES)
        for idx, cat in enumerate(categories, start=1):
            category_choice = category_choices_dict.get(cat["category"], cat["category"])
            category_data.append(
                {
                    "id": idx,
                    "name": category_choice,
                    "slug": cat["category"],
                    "count": cat["count"],
                }
            )

        cache.set("blog_categories", category_data, timeout=ONE_HOUR)
        return Response(category_data)


class ContactView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle]

    def post(self, request) -> Response:
        log_site_visit(request)

        ip_address = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        # reCAPTCHA verification (with IP)
        recaptcha_response = request.data.get("recaptcha_token", "")
        if not verify_recaptcha(recaptcha_response, ip_address):
            return Response(
                {"error": "reCAPTCHA 검증에 실패했습니다. 다시 시도해주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Spam check
        email = request.data.get("email", "")
        if self._is_spam_attempt(ip_address, email):
            return Response(
                {"error": "너무 많은 문의를 보내셨습니다. 잠시 후 다시 시도해주세요."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = ContactSerializer(data=request.data)
        if not serializer.is_valid():
            self._log_contact_attempt(ip_address, email, False)
            return Response(
                {
                    "error": "입력 데이터가 올바르지 않습니다.",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Save contact data (with IP and User Agent)
            contact = serializer.save(ip_address=ip_address, user_agent=user_agent)

            # Send email notification
            subject = f"[에멜무지로 문의] {contact.get_inquiry_type_display()} - {contact.name}"
            message = self._create_email_message(contact)

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=False,
            )

            # Log successful contact attempt
            self._log_contact_attempt(ip_address, email, True)

            return Response(
                {"message": "문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다."},
                status=status.HTTP_201_CREATED,
            )

        except BadHeaderError:
            self._log_contact_attempt(ip_address, email, False)
            return Response(
                {"error": "잘못된 이메일 헤더입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            self._log_contact_attempt(ip_address, email, False)
            logger.error(f"Contact form error: {str(e)}")
            return Response(
                {"error": "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _is_spam_attempt(self, ip_address: str, email: str) -> bool:
        """Check for spam attempts (security-hardened)"""
        try:
            # Check if IP or email is explicitly blocked
            blocked_filter = Q(ip_address=ip_address, is_blocked=True)
            if email and self._is_valid_email(email):
                blocked_filter |= Q(email=email, is_blocked=True)
            if ContactAttempt.objects.filter(blocked_filter).exists():
                return True

            # IP-based check (limit 3 per hour)
            ip_attempts = ContactAttempt.objects.filter(
                ip_address=ip_address,
                last_attempt__gte=timezone.now() - timedelta(hours=1),
            ).first()

            if ip_attempts and ip_attempts.attempt_count >= 3:
                return True

            # Email-based check (limit 2 per day)
            if email and self._is_valid_email(email):
                email_attempts = ContactAttempt.objects.filter(
                    email=email, last_attempt__gte=timezone.now() - timedelta(days=1)
                ).first()

                if email_attempts and email_attempts.attempt_count >= 2:
                    return True

            # Suspicious pattern check
            if self._is_suspicious_content(email):
                logger.warning(f"Suspicious email pattern detected: {email}")
                return True

            return False
        except Exception as e:
            # Fail closed: treat as spam when the check itself fails (e.g. DB error)
            logger.error(f"Spam check failed (blocking request): {e}")
            return True

    def _is_valid_email(self, email: str) -> bool:
        """Validate email address"""
        try:
            validate_email(email)
            return True
        except (ValidationError, DjangoValidationError):
            return False

    def _is_suspicious_content(self, email: str) -> bool:
        """Check for suspicious content patterns"""
        suspicious_patterns = [
            r"[0-9]{10,}",  # Excessively long numbers
            r"(.)\1{5,}",  # Repeated characters
            r"test.*test",  # Test patterns
            r"spam|phishing|scam",  # Spam keywords
        ]

        for pattern in suspicious_patterns:
            if re.search(pattern, email.lower()):
                return True
        return False

    def _log_contact_attempt(self, ip_address: str, email: str, success: bool):
        """Log contact attempt"""
        try:
            normalized_email = (email or "").strip().lower()
            attempt, created = ContactAttempt.objects.get_or_create(
                ip_address=ip_address,
                email=normalized_email,
                defaults={"attempt_count": 1},
            )

            if not created:
                ContactAttempt.objects.filter(pk=attempt.pk).update(attempt_count=F("attempt_count") + 1)

        except Exception as e:
            logger.error(f"Failed to log contact attempt: {e}")

    def _create_email_message(self, contact: Contact) -> str:
        """Create email message body"""
        return f"""
에멜무지로 홈페이지를 통해 새로운 문의가 접수되었습니다.

▣ 문의 정보
- 문의 유형: {contact.get_inquiry_type_display()}
- 접수 일시: {contact.created_at.strftime('%Y년 %m월 %d일 %H시 %M분')}

▣ 문의자 정보
- 이름: {contact.name}
- 이메일: {contact.email}
- 회사명: {contact.company or '미입력'}
- 연락처: {contact.phone or '미입력'}

▣ 문의 내용
제목: {contact.subject}

내용:
{contact.message}

▣ 기술 정보
- IP 주소: {contact.ip_address}
- 문의 ID: {contact.id}

---
이 메일은 자동으로 발송된 메일입니다.
"""


class NewsletterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        """Newsletter subscription"""
        log_site_visit(request)

        ip_address = get_client_ip(request)
        serializer = NewsletterSubscriptionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "error": "입력 데이터가 올바르지 않습니다.",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            email = serializer.validated_data["email"]
            name = serializer.validated_data.get("name", "")

            # Check if email is already subscribed
            existing = NewsletterSubscription.objects.filter(email=email).first()
            if existing:
                if existing.is_active:
                    return Response(
                        {"message": "이미 구독된 이메일입니다."},
                        status=status.HTTP_200_OK,
                    )
                else:
                    # Reactivate inactive subscription
                    existing.is_active = True
                    existing.unsubscribed_at = None
                    existing.save()
                    return Response(
                        {"message": "뉴스레터 구독이 재활성화되었습니다."},
                        status=status.HTTP_200_OK,
                    )

            # Create new subscription
            NewsletterSubscription.objects.create(email=email, name=name, ip_address=ip_address)

            return Response(
                {"message": "뉴스레터 구독이 완료되었습니다."},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Newsletter subscription error: {e}")
            return Response(
                {"error": "구독 처리 중 오류가 발생했습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["GET"])
@throttle_classes([])
def health_check(request):
    """Server health check (no throttle — called by Docker healthcheck every 30s)"""
    return Response({"status": "healthy", "timestamp": timezone.now()})


@api_view(["GET"])
def send_test_email(request):
    """Test email endpoint (DEBUG mode only)"""
    if not settings.DEBUG:
        return Response({"error": "이 기능은 개발 모드에서만 사용할 수 있습니다."}, status=403)

    try:
        send_mail(
            subject="테스트 이메일",
            message="이것은 테스트 이메일입니다.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        return Response({"message": "테스트 이메일이 성공적으로 전송되었습니다."}, status=200)
    except BadHeaderError:
        return Response({"error": "잘못된 이메일 헤더입니다."}, status=400)
    except Exception as e:
        logger.error(f"Email send failure: {e}")
        return Response({"error": "이메일 전송에 실패했습니다."}, status=500)


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Notification API — list, retrieve, mark read"""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        # Only allow marking as read via update
        if serializer.validated_data.get("is_read") and not serializer.instance.is_read:
            serializer.save(read_at=timezone.now())
        else:
            serializer.save()

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Mark all unread notifications as read"""
        count = Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        return Response({"marked": count})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})

    @action(detail=False, methods=["get", "patch"])
    def preferences(self, request):
        """Get or update notification preferences"""
        pref, _created = NotificationPreference.objects.get_or_create(user=request.user)

        if request.method == "GET":
            serializer = NotificationPreferenceSerializer(pref)
            return Response(serializer.data)

        serializer = NotificationPreferenceSerializer(pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


def send_user_notification(user, title, message, level="info", notification_type="system", url=""):
    """Create a notification and optionally send email.

    Respects user notification preferences: if the notification type is disabled,
    the notification is not created. If email is enabled, sends an email copy.

    Args:
        user: User instance or user ID
        title: Notification title
        message: Notification message body
        level: info/success/warning/error
        notification_type: system/blog/contact/admin
        url: Optional link URL

    Returns:
        The created Notification instance, or None if type is disabled
    """
    from django.contrib.auth.models import User as UserModel

    if isinstance(user, int):
        user = UserModel.objects.get(pk=user)

    # Check user preferences
    try:
        pref = NotificationPreference.objects.get(user=user)
        if not pref.is_type_enabled(notification_type):
            return None
    except NotificationPreference.DoesNotExist:
        pref = None

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        level=level,
        notification_type=notification_type,
        url=url,
    )

    # Send email if enabled
    if pref and pref.email_enabled and user.email:
        try:
            send_mail(
                subject=f"[에멜무지로] {title}",
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.warning(f"Failed to send notification email: {e}")

    return notification
