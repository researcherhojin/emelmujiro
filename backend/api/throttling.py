from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from .utils import get_client_ip


class ClientIPMixin:
    def get_ident(self, request):
        return get_client_ip(request)


class ClientIPAnonRateThrottle(ClientIPMixin, AnonRateThrottle):
    """Use the same trusted client identity as the security middleware."""


class ClientIPUserRateThrottle(ClientIPMixin, UserRateThrottle):
    """Preserve user buckets and use trusted IPs for anonymous requests."""
