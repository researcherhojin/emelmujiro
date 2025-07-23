import logging
import time
import json
from django.http import HttpResponseForbidden, JsonResponse
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import re

logger = logging.getLogger("security")


class SecurityMiddleware(MiddlewareMixin):
    """보안 미들웨어"""

    def __init__(self, get_response):
        self.get_response = get_response

        # 악성 패턴 정의
        self.malicious_patterns = [
            r"<script[^>]*>.*?</script>",  # XSS
            r"javascript:",
            r"eval\(",
            r"document\.cookie",
            r"union\s+select",  # SQL Injection
            r"drop\s+table",
            r"insert\s+into",
            r"\.\./",  # Path Traversal
            r"etc/passwd",
            r"proc/self/environ",
        ]

        # 컴파일된 패턴
        self.compiled_patterns = [
            re.compile(pattern, re.IGNORECASE) for pattern in self.malicious_patterns
        ]

    def process_request(self, request):
        """요청 전처리"""
        ip_address = self.get_client_ip(request)

        # IP 차단 체크
        if self.is_blocked_ip(ip_address):
            logger.warning(f"Blocked IP attempted access: {ip_address}")
            return HttpResponseForbidden("Access denied")

        # Rate limiting 체크
        if self.is_rate_limited(ip_address):
            logger.warning(f"Rate limited IP: {ip_address}")
            return JsonResponse(
                {"error": "Too many requests. Please try again later."}, status=429
            )

        # 악성 요청 패턴 체크
        if self.contains_malicious_content(request):
            logger.error(
                f"Malicious request detected from {ip_address}: {request.path}"
            )
            self.block_ip_temporarily(ip_address)
            return HttpResponseForbidden("Malicious request detected")

        # 요청 로깅
        self.log_request(request, ip_address)

        return None

    def get_client_ip(self, request):
        """클라이언트 IP 주소 추출"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR", "")
        return ip

    def is_blocked_ip(self, ip_address):
        """IP 차단 여부 확인"""
        # 영구 차단 목록 (Redis나 DB에서 관리하는 것이 좋음)
        blocked_ips = cache.get("permanently_blocked_ips", set())

        # 임시 차단 체크
        temp_block_key = f"temp_blocked_{ip_address}"

        return ip_address in blocked_ips or cache.get(temp_block_key, False)

    def is_rate_limited(self, ip_address):
        """Rate limiting 체크"""
        rate_limit_key = f"rate_limit_{ip_address}"
        current_requests = cache.get(rate_limit_key, 0)

        if current_requests >= 100:  # 시간당 100회 제한
            return True

        # 카운터 증가
        cache.set(rate_limit_key, current_requests + 1, 3600)  # 1시간
        return False

    def contains_malicious_content(self, request):
        """악성 콘텐츠 포함 여부 체크"""
        # URL 체크
        for pattern in self.compiled_patterns:
            if pattern.search(request.path):
                return True

        # Query parameters 체크
        for key, value in request.GET.items():
            for pattern in self.compiled_patterns:
                if pattern.search(str(value)):
                    return True

        # POST 데이터 체크
        if hasattr(request, "body") and request.body:
            try:
                body_str = request.body.decode("utf-8")
                for pattern in self.compiled_patterns:
                    if pattern.search(body_str):
                        return True
            except UnicodeDecodeError:
                pass

        return False

    def block_ip_temporarily(self, ip_address, duration=3600):
        """IP 임시 차단"""
        temp_block_key = f"temp_blocked_{ip_address}"
        cache.set(temp_block_key, True, duration)

        # 차단 횟수 증가
        block_count_key = f"block_count_{ip_address}"
        block_count = cache.get(block_count_key, 0) + 1
        cache.set(block_count_key, block_count, 86400)  # 24시간

        # 3회 이상 차단 시 영구 차단 검토
        if block_count >= 3:
            logger.critical(
                f"IP {ip_address} blocked {block_count} times. Consider permanent block."
            )

    def log_request(self, request, ip_address):
        """요청 로깅"""
        # 민감한 정보는 로깅하지 않음
        sensitive_paths = ["/api/contact/", "/admin/"]

        if request.path in sensitive_paths:
            logger.info(
                f"Sensitive endpoint accessed: {request.path} from {ip_address}"
            )


class ContentSecurityMiddleware(MiddlewareMixin):
    """Content Security Policy 미들웨어"""

    def process_response(self, request, response):
        """응답에 보안 헤더 추가"""

        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.github.com; "
            "frame-src 'none'; "
            "object-src 'none'; "
            "base-uri 'self';"
        )

        response["Content-Security-Policy"] = csp_policy

        # 추가 보안 헤더
        response["Permissions-Policy"] = (
            "camera=(), "
            "microphone=(), "
            "geolocation=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "accelerometer=()"
        )

        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["X-XSS-Protection"] = "1; mode=block"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # API 응답에서 서버 정보 숨김
        if "Server" in response:
            del response["Server"]

        return response


class APIResponseTimeMiddleware(MiddlewareMixin):
    """API 응답 시간 모니터링 미들웨어"""

    def process_request(self, request):
        request.start_time = time.time()

    def process_response(self, request, response):
        if hasattr(request, "start_time"):
            duration = time.time() - request.start_time

            # 느린 요청 로깅 (3초 이상)
            if duration > 3.0:
                logger.warning(f"Slow request: {request.path} took {duration:.2f}s")

            # 개발 모드에서만 응답 시간 헤더 추가
            if settings.DEBUG:
                response["X-Response-Time"] = f"{duration:.3f}s"

        return response
