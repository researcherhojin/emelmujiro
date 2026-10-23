# cspell:ignore CREAT RDWR
"""Serialize login throttle updates on the shared local filesystem."""

import fcntl
import logging
import os
import time
from pathlib import Path

from django.conf import settings

from .throttling import ClientIPAnonRateThrottle

logger = logging.getLogger("security")


class LoginRateThrottle(ClientIPAnonRateThrottle):
    scope = "login"

    def allow_request(self, request, view):
        # FileBasedCache's read/update is not atomic. A separate open per call
        # makes flock serialize both threads and processes on this host.
        directory = Path(settings.CACHES["default"]["LOCATION"])
        deadline = time.monotonic() + 1
        self.lock_failed = False
        try:
            directory.mkdir(parents=True, exist_ok=True)
            fd = os.open(
                directory / "login-throttle.lock", os.O_CREAT | os.O_RDWR, 0o600
            )
            with os.fdopen(fd, "a") as lock:
                while True:
                    try:
                        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        break
                    except BlockingIOError:
                        if time.monotonic() >= deadline:
                            self.lock_failed = True
                            return False
                        time.sleep(0.01)
                try:
                    return super().allow_request(request, view)
                finally:
                    fcntl.flock(lock, fcntl.LOCK_UN)
        except OSError:
            logger.exception("Login throttle lock unavailable")
            self.lock_failed = True
            return False

    def wait(self):
        return 1 if self.lock_failed else super().wait()
