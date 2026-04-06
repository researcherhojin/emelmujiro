import ipaddress

from django.db import transaction
from django.db.models import F
from django.http import HttpRequest


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


def toggle_like(obj, like_model, like_field, ip_address):
    """Toggle a like on an object (one per IP).

    Args:
        obj: The object being liked (BlogPost or BlogComment)
        like_model: The like model class (BlogLike or CommentLike)
        like_field: The field name on the like model ('post' or 'comment')
        ip_address: The IP address of the user

    Returns:
        dict with 'liked' (bool) and 'likes' (int)
    """
    with transaction.atomic():
        like, created = like_model.objects.get_or_create(**{like_field: obj}, ip_address=ip_address)
        if not created:
            like.delete()
        type(obj).objects.filter(id=obj.id).update(likes=F("likes") + (1 if created else -1))
    obj.refresh_from_db()
    return {"liked": created, "likes": obj.likes}
