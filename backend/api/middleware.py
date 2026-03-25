import logging
import time
from django.http import HttpResponseForbidden, JsonResponse
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import re

from api.views import get_client_ip

logger = logging.getLogger("security")

# Time constants (seconds)
ONE_HOUR = 3600
ONE_DAY = 86400

# Rate limiting thresholds
RATE_LIMIT_PER_HOUR = 100
TEMP_BLOCK_ESCALATION_THRESHOLD = 3


class RequestSecurityMiddleware(MiddlewareMixin):
    """Request security middleware — malicious pattern detection and IP blocking"""

    def __init__(self, get_response):
        super().__init__(get_response)

        # Malicious pattern definitions
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

        # Compiled patterns
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.malicious_patterns]

    # Paths exempt from rate limiting (Docker healthcheck, etc.)
    RATE_LIMIT_EXEMPT_PATHS = {"/api/health/"}

    def process_request(self, request):
        """Pre-process incoming request"""
        ip_address = get_client_ip(request)

        # IP block check
        if self.is_blocked_ip(ip_address):
            logger.warning(f"Blocked IP attempted access: {ip_address}")
            return HttpResponseForbidden("Access denied")

        # Rate limiting check (skip exempt paths like health check)
        if request.path not in self.RATE_LIMIT_EXEMPT_PATHS and self.is_rate_limited(ip_address):
            logger.warning(f"Rate limited IP: {ip_address}")
            return JsonResponse({"error": "Too many requests. Please try again later."}, status=429)

        # Malicious request pattern check
        if self.contains_malicious_content(request):
            logger.error(f"Malicious request detected from {ip_address}: {request.path}")
            self.block_ip_temporarily(ip_address)
            return HttpResponseForbidden("Malicious request detected")

        # Request logging
        self.log_request(request, ip_address)

        return None

    def is_blocked_ip(self, ip_address):
        """Check if IP is blocked"""
        # Permanent block list (ideally managed via Redis or DB)
        blocked_ips = cache.get("permanently_blocked_ips", set())

        # Temporary block check
        temp_block_key = f"temp_blocked_{ip_address}"

        return ip_address in blocked_ips or cache.get(temp_block_key, False)

    def is_rate_limited(self, ip_address):
        """Rate limiting check"""
        rate_limit_key = f"rate_limit_{ip_address}"
        current_requests = cache.get(rate_limit_key, 0)

        if current_requests >= RATE_LIMIT_PER_HOUR:
            return True

        # Increment counter
        cache.set(rate_limit_key, current_requests + 1, ONE_HOUR)
        return False

    def contains_malicious_content(self, request):
        """Check for malicious content in request"""
        # URL check
        for pattern in self.compiled_patterns:
            if pattern.search(request.path):
                return True

        # Query parameters check
        for key, value in request.GET.items():
            for pattern in self.compiled_patterns:
                if pattern.search(str(value)):
                    return True

        # POST body check
        if hasattr(request, "body") and request.body:
            try:
                body_str = request.body.decode("utf-8")
                for pattern in self.compiled_patterns:
                    if pattern.search(body_str):
                        return True
            except UnicodeDecodeError:
                logger.warning(f"Non-UTF-8 request body from {get_client_ip(request)}")

        return False

    def block_ip_temporarily(self, ip_address, duration=ONE_HOUR):
        """Temporarily block an IP address"""
        temp_block_key = f"temp_blocked_{ip_address}"
        cache.set(temp_block_key, True, duration)

        # Increment block count
        block_count_key = f"block_count_{ip_address}"
        block_count = cache.get(block_count_key, 0) + 1
        cache.set(block_count_key, block_count, ONE_DAY)

        # Escalation threshold check
        if block_count >= TEMP_BLOCK_ESCALATION_THRESHOLD:
            logger.critical(f"IP {ip_address} blocked {block_count} times. Consider permanent block.")

    def log_request(self, request, ip_address):
        """Log request (exclude sensitive information)"""
        sensitive_paths = ["/api/contact/", "/admin/"]

        if request.path in sensitive_paths:
            logger.info(f"Sensitive endpoint accessed: {request.path} from {ip_address}")


class ContentSecurityMiddleware(MiddlewareMixin):
    """Content Security Policy middleware"""

    def process_response(self, request, response):
        """Add security headers to response"""

        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.github.com; "
            "frame-src https://www.google.com https://recaptcha.google.com; "
            "object-src 'none'; "
            "base-uri 'self';"
        )

        response["Content-Security-Policy"] = csp_policy

        # Additional security headers
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

        # Hide server info in API responses
        if "Server" in response:
            del response["Server"]

        return response


class APIResponseTimeMiddleware(MiddlewareMixin):
    """API response time monitoring middleware"""

    def process_request(self, request):
        request.start_time = time.time()

    def process_response(self, request, response):
        if hasattr(request, "start_time"):
            duration = time.time() - request.start_time

            # Log slow requests (over 3 seconds)
            if duration > 3.0:
                logger.warning(f"Slow request: {request.path} took {duration:.2f}s")

            # Add response time header in debug mode only
            if settings.DEBUG:
                response["X-Response-Time"] = f"{duration:.3f}s"

        return response
