import hashlib
import logging
import os
import re
import uuid as uuid_mod
from datetime import timedelta
from typing import ClassVar

import requests
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import BadHeaderError, send_mail
from django.core.validators import validate_email
from django.db.models import Count, F, Q
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action, api_view, throttle_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .constants import (
    CACHE_BLOG_CATEGORIES,
    CACHE_BLOG_POST_LIST,
    MAX_FAILED_CONTACT_ATTEMPTS,
    ONE_DAY,
    ONE_HOUR,
    is_spam,
)
from .models import (
    BlogComment,
    BlogLike,
    BlogPost,
    CommentLike,
    Contact,
    ContactAttempt,
    NewsletterSubscription,
    Notification,
    NotificationPreference,
    SiteVisit,
)
from .serializers import (
    BlogCommentSerializer,
    BlogPostSerializer,
    BlogPostWriteSerializer,
    ContactSerializer,
    NewsletterSubscriptionSerializer,
    NotificationPreferenceSerializer,
    NotificationSerializer,
)
from .throttling import ClientIPAnonRateThrottle
from .utils import get_client_ip, sanitize_referer, toggle_like

logger = logging.getLogger(__name__)


class ContactRateThrottle(ClientIPAnonRateThrottle):
    """Contact form rate throttle"""

    scope = "contact"
    rate = "5/hour"


class CommentRateThrottle(ClientIPAnonRateThrottle):
    """Comment creation rate throttle"""

    scope = "comment"
    rate = "10/hour"


class NewsletterRateThrottle(ClientIPAnonRateThrottle):
    """Newsletter subscription rate throttle.

    No inline `rate` on purpose: the sibling classes here override the
    configured rate, so settings.DEFAULT_THROTTLE_RATES['newsletter'] is the
    single source of truth for this scope (same as LoginRateThrottle).
    """

    scope = "newsletter"


def verify_recaptcha(recaptcha_response: str, request_ip: str | None = None) -> bool:
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
    except Exception:
        logger.exception("reCAPTCHA verification failed")
        return False


def log_site_visit(request: HttpRequest):
    """Log site visit"""
    try:
        ip_address = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        referer = sanitize_referer(
            request.META.get("HTTP_REFERER", ""),
            SiteVisit._meta.get_field("referer").max_length,
        )
        page_path = request.path
        session_id = request.session.session_key or ""

        SiteVisit.objects.create(
            ip_address=ip_address,
            user_agent=user_agent,
            referer=referer,
            page_path=page_path,
            session_id=session_id,
        )
    except Exception:
        logger.exception("Failed to log site visit")


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
            match = Q(title__icontains=search) | Q(description__icontains=search) | Q(content__icontains=search)
            # /en sends lang=en: the English fields add matches on top of the
            # Korean ones, because /en still lists untranslated posts in Korean.
            # Without lang=en the query is exactly the Korean-only one.
            if self.request.query_params.get("lang") == "en":
                match |= (
                    Q(title_en__icontains=search)
                    | Q(description_en__icontains=search)
                    | Q(content_html_en__icontains=search)
                )
            queryset = queryset.filter(match)
        if featured and featured.lower() == "true":
            queryset = queryset.filter(is_featured=True)

        return queryset

    def perform_create(self, serializer):
        author = self.request.user.get_full_name() or self.request.user.username
        serializer.save(author=author)
        cache.delete(CACHE_BLOG_CATEGORIES)
        cache.delete(CACHE_BLOG_POST_LIST)

    def perform_update(self, serializer):
        serializer.save()
        cache.delete(CACHE_BLOG_CATEGORIES)
        cache.delete(CACHE_BLOG_POST_LIST)

    def perform_destroy(self, instance):
        instance.delete()
        cache.delete(CACHE_BLOG_CATEGORIES)
        cache.delete(CACHE_BLOG_POST_LIST)

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

        # Cache the bare public list (no query string at all) for 30 seconds.
        # The key is fixed, so any parameter that shapes the response must
        # bypass it: allow-listing filters missed `page_size`, and a cold-cache
        # `?page_size=1` then served a 1-item list to every bare request.
        is_public = not (request.user and request.user.is_staff)
        if is_public and not request.query_params:
            cache_key = CACHE_BLOG_POST_LIST
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
        cache.delete(CACHE_BLOG_CATEGORIES)
        cache.delete(CACHE_BLOG_POST_LIST)
        return Response({"id": post.id, "is_published": post.is_published})

    @action(detail=True, methods=["post"], url_path="like", permission_classes=[AllowAny])
    def like(self, request, slug=None):
        """Toggle like on a blog post (one per IP)."""
        return Response(toggle_like(self.get_object(), BlogLike, "post", get_client_ip(request)))


class BlogCommentViewSet(viewsets.ModelViewSet):
    """CRUD for blog comments. Anyone can create/read; only admin can delete."""

    serializer_class = BlogCommentSerializer
    permission_classes: ClassVar[list[type]] = [AllowAny]
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
        post = self.get_post()
        return BlogComment.objects.filter(post=post, parent__isnull=True).prefetch_related(
            "replies", "comment_likes", "replies__comment_likes"
        )

    def get_post(self):
        posts = BlogPost.objects.all()
        if not self.request.user.is_staff:
            posts = posts.filter(is_published=True)
        return get_object_or_404(posts, pk=self.kwargs["post_pk"])

    def perform_create(self, serializer):
        post = self.get_post()
        if serializer.validated_data["post"].pk != post.pk:
            raise ValidationError({"post": "Post must match the requested URL."})
        parent = serializer.validated_data.get("parent")
        if parent and parent.post_id != post.pk:
            raise ValidationError({"parent": "Reply must belong to the same post."})
        ip_address = get_client_ip(self.request)

        # Spam keyword check
        content = serializer.validated_data.get("content", "")
        if is_spam(content):
            raise ValidationError({"content": "스팸으로 의심되는 내용이 포함되어 있습니다."})

        serializer.save(post=post, ip_address=ip_address)

    @action(detail=True, methods=["post"], url_path="like")
    def like(self, request, post_pk=None, pk=None):
        """Toggle like on a comment (one per IP)."""
        return Response(toggle_like(self.get_object(), CommentLike, "comment", get_client_ip(request)))


class BlogImageUploadView(APIView):
    permission_classes: ClassVar[list[type]] = [IsAdminUser]

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
            dest.writelines(file.chunks())

        relative_url = f"/media/blog/images/{now.year}/{now.month:02d}/{safe_name}"
        return Response({"url": relative_url}, status=status.HTTP_201_CREATED)


class CategoryListView(APIView):
    permission_classes: ClassVar[list[type]] = [AllowAny]

    def get(self, request):
        log_site_visit(request)

        # Return cached category data if available
        cached = cache.get(CACHE_BLOG_CATEGORIES)
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

        cache.set(CACHE_BLOG_CATEGORIES, category_data, timeout=ONE_HOUR)
        return Response(category_data)


class ContactView(APIView):
    permission_classes: ClassVar[list[type]] = [AllowAny]
    throttle_classes: ClassVar[list[type]] = [ContactRateThrottle]

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
        except Exception:
            self._log_contact_attempt(ip_address, email, False)
            logger.exception("Contact form error")
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

            # Failure-based check: accumulated failed attempts from an IP signal a bot
            if ContactAttempt.objects.filter(
                ip_address=ip_address,
                failure_count__gte=MAX_FAILED_CONTACT_ATTEMPTS,
            ).exists():
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
        except Exception:
            # Fail closed: treat as spam when the check itself fails (e.g. DB error)
            logger.exception("Spam check failed (blocking request)")
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
        """Log contact attempt; failed attempts feed spam detection."""
        try:
            normalized_email = (email or "").strip().lower()
            attempt, created = ContactAttempt.objects.get_or_create(
                ip_address=ip_address,
                email=normalized_email,
                defaults={"attempt_count": 1, "failure_count": 0 if success else 1},
            )

            if not created:
                updates = {"attempt_count": F("attempt_count") + 1}
                if not success:
                    updates["failure_count"] = F("failure_count") + 1
                ContactAttempt.objects.filter(pk=attempt.pk).update(**updates)

        except Exception:
            logger.exception("Failed to log contact attempt")

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
    permission_classes: ClassVar[list[type]] = [AllowAny]
    throttle_classes: ClassVar[list[type]] = [NewsletterRateThrottle]

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

        except Exception:
            logger.exception("Newsletter subscription error")
            return Response(
                {"error": "구독 처리 중 오류가 발생했습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["GET"])
@throttle_classes([])
def health_check(request):
    """Server health check (no throttle — called by Docker healthcheck every 30s)"""
    return Response({"status": "healthy", "timestamp": timezone.now(), "commit": settings.GIT_COMMIT})


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
    except Exception:
        logger.exception("Email send failure")
        return Response({"error": "이메일 전송에 실패했습니다."}, status=500)


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Notification API — list, retrieve, mark read"""

    serializer_class = NotificationSerializer
    permission_classes: ClassVar[list[type]] = [IsAuthenticated]

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
