import logging
import re
import time

from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponseForbidden, JsonResponse

from api.constants import ONE_DAY, ONE_HOUR
from api.utils import get_client_ip

logger = logging.getLogger("security")
# File-only access log — the single request-level record of traffic to
# api.emelmujiro.com. See config/settings.py for why gunicorn's own access
# log could not serve this, and APIResponseTimeMiddleware for what it writes.
access_logger = logging.getLogger("api.access")

# Rate limiting thresholds
RATE_LIMIT_PER_HOUR = 100
BLOCK_ESCALATION_THRESHOLD = 3


class RequestSecurityMiddleware:
    """Request security middleware — malicious pattern detection and IP blocking"""

    def __init__(self, get_response):
        self.get_response = get_response

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
    RATE_LIMIT_EXEMPT_PATHS = frozenset({"/api/health/"})

    def __call__(self, request):
        """Process incoming request and return response"""
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

        return self.get_response(request)

    def is_blocked_ip(self, ip_address):
        """Check if IP is blocked"""
        # Permanent block list (ideally managed via Redis or DB)
        blocked_ips = cache.get("permanently_blocked_ips", set())

        # Temporary block check
        temp_block_key = f"temp_blocked_{ip_address}"

        return ip_address in blocked_ips or cache.get(temp_block_key, False)

    def is_rate_limited(self, ip_address):
        """Fixed one-hour window per IP, starting at that IP's first request.

        Deliberately not cache.incr(): BaseCache.incr() re-saves the key with no
        timeout, i.e. the backend's default TIMEOUT (300 s), and FileBasedCache
        inherits it — so every request cut the window to 5 minutes. Django's docs
        say nothing about incr() and expiry, so the window start is stored in the
        value and the remaining lifetime is passed explicitly. Not atomic across
        workers; per the docs, incr() on this backend was a two-step
        retrieve/update too.
        """
        rate_limit_key = f"rate_limit_{ip_address}"
        now = time.time()

        entry = cache.get(rate_limit_key)
        # Reuse only an unexpired window in the current format; anything else
        # (no entry, a bare int written before this format, or an entry the
        # backend has not culled yet) starts a new one. Checking expiry here,
        # not trusting the cache TTL, keeps `remaining` positive — per the docs
        # a timeout of 0 would not cache the value at all.
        if isinstance(entry, tuple) and len(entry) == 2 and now < entry[0] + ONE_HOUR:
            window_start, current_requests = entry
        else:
            window_start, current_requests = now, 0

        current_requests += 1
        remaining = window_start + ONE_HOUR - now
        cache.set(rate_limit_key, (window_start, current_requests), remaining)

        return current_requests > RATE_LIMIT_PER_HOUR

    def contains_malicious_content(self, request):
        """Check for malicious content in request"""
        # URL check
        for pattern in self.compiled_patterns:
            if pattern.search(request.path):
                return True

        # Query parameters check — every value of a repeated key, not just the
        # last one that QueryDict.items() returns, or `?q=<payload>&q=ok` passes
        for _key, values in request.GET.lists():
            for value in values:
                for pattern in self.compiled_patterns:
                    if pattern.search(value):
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
        if block_count >= BLOCK_ESCALATION_THRESHOLD:
            logger.critical(f"IP {ip_address} blocked {block_count} times. Consider permanent block.")

    def log_request(self, request, ip_address):
        """Log request (exclude sensitive information)"""
        sensitive_paths = ["/api/contact/", "/admin/"]

        if request.path in sensitive_paths:
            logger.info(f"Sensitive endpoint accessed: {request.path} from {ip_address}")


class ContentSecurityMiddleware:
    """Content Security Policy middleware"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        """Add security headers to response"""
        response = self.get_response(request)

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


class APIResponseTimeMiddleware:
    """API response time monitoring, and the API access log."""

    # Excluded from the access log because they are machine noise, not traffic:
    # the Docker healthcheck probes /api/health/ every 30s (~2,880/day) and the
    # health cron adds more. Including them would rotate the real requests out.
    ACCESS_LOG_EXCLUDE = ("/api/health/",)

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.start_time = time.time()

        response = self.get_response(request)

        if hasattr(request, "start_time"):
            duration = time.time() - request.start_time

            # Log slow requests (over 3 seconds)
            if duration > 3.0:
                logger.warning(f"Slow request: {request.path} took {duration:.2f}s")

            # Add response time header in debug mode only
            if settings.DEBUG:
                response["X-Response-Time"] = f"{duration:.3f}s"

            self.log_access(request, response, duration)

        return response

    def log_access(self, request, response, duration):
        """Write one access-log line per API request.

        Referer and user-agent are the point: they are what separates a
        first-party call (referer on emelmujiro.com, browser UA) from an
        external consumer (no referer, script UA). Without them this log
        cannot answer the question it exists for.

        IP comes from the shared `get_client_ip`, which trusts only
        CF-Connecting-IP and REMOTE_ADDR — never a client-settable
        forwarding header (see api/utils.py).
        """
        if not request.path.startswith("/api/"):
            return
        if request.path in self.ACCESS_LOG_EXCLUDE:
            return

        access_logger.info(
            '%s %s %s %.3fs ip=%s ref="%s" ua="%s"',
            request.method,
            request.get_full_path(),
            getattr(response, "status_code", "-"),
            duration,
            get_client_ip(request),
            request.META.get("HTTP_REFERER", "-"),
            request.META.get("HTTP_USER_AGENT", "-"),
        )
