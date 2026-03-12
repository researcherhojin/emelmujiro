from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from django.db.models import Q, F, Count
from django.utils import timezone
from django.core.cache import cache
from django.http import HttpRequest
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from datetime import timedelta
import requests
import logging
import hashlib
import re

from .models import BlogPost, Contact, ContactAttempt, SiteVisit, NewsletterSubscription
from .serializers import (
    BlogPostSerializer,
    ContactSerializer,
    NewsletterSubscriptionSerializer,
)

logger = logging.getLogger(__name__)

# Time constants (seconds)
ONE_HOUR = 3600
ONE_DAY = 86400


class ContactRateThrottle(AnonRateThrottle):
    """Contact form rate throttle"""

    scope = "contact"
    rate = "5/hour"


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
    try:
        # IPv4 regex
        ipv4_pattern = r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
        # IPv6 basic pattern
        ipv6_pattern = r"^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$"

        return bool(re.match(ipv4_pattern, ip) or re.match(ipv6_pattern, ip))
    except (re.error, TypeError):
        return False


def verify_recaptcha(recaptcha_response: str, request_ip: str = None) -> bool:
    """Verify reCAPTCHA response (security-hardened)"""
    if not settings.RECAPTCHA_PRIVATE_KEY:
        return True  # Pass if reCAPTCHA is not configured

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


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
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

    def retrieve(self, request, *args, **kwargs):
        """Retrieve individual post with view count increment and visit log"""
        log_site_visit(request)

        response = super().retrieve(request, *args, **kwargs)

        # Increment view count (once per day per IP)
        instance = self.get_object()
        ip_address = get_client_ip(request)
        cache_key = f"blog_view_{instance.id}_{hashlib.sha256(ip_address.encode()).hexdigest()[:16]}"

        if not cache.get(cache_key):
            BlogPost.objects.filter(id=instance.id).update(view_count=F("view_count") + 1)
            cache.set(cache_key, True, timeout=ONE_DAY)

        return response

    def list(self, request, *args, **kwargs):
        """List posts with visit log"""
        log_site_visit(request)
        return super().list(request, *args, **kwargs)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        log_site_visit(request)

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
        except ValidationError:
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
@throttle_classes([AnonRateThrottle])
def health_check(request):
    """Server health check"""
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
