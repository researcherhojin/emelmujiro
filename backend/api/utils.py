import ipaddress

from django.db import transaction
from django.db.models import F
from django.http import HttpRequest


def get_client_ip(request: HttpRequest) -> str:
    """Extract client IP address — trusts ONLY Cloudflare header + REMOTE_ADDR.

    SECURITY: Does NOT trust X-Forwarded-For, X-Real-IP, or any other
    client-settable header. Rationale: this deployment sits behind Cloudflare
    Tunnel → nginx → Django. Cloudflare guarantees CF-Connecting-IP is set to
    the real client IP and strips any client-provided value, so it is
    authoritative in production. For local dev / test / direct hits, REMOTE_ADDR
    is Django's view of the immediate peer. Trusting the first element of
    X-Forwarded-For would let anyone spoof their apparent IP by sending that
    header, bypassing IP-based rate limiting, view counting, and IP blocking.
    """
    cf_ip = request.META.get("HTTP_CF_CONNECTING_IP")
    if cf_ip and _is_valid_ip(cf_ip.strip()):
        return cf_ip.strip()

    remote_addr = request.META.get("REMOTE_ADDR")
    if remote_addr and _is_valid_ip(remote_addr.strip()):
        return remote_addr.strip()

    return "127.0.0.1"


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
