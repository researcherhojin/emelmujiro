from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from unittest.mock import patch

from django.core.cache import cache
from django.test import RequestFactory, SimpleTestCase
from rest_framework.request import Request

from .login_throttle import LoginRateThrottle


def attempt(_):
    request = Request(
        RequestFactory().post("/api/auth/login/", REMOTE_ADDR="203.0.113.71")
    )
    return LoginRateThrottle().allow_request(request, None)


class LoginConcurrencyTests(SimpleTestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_threads_share_exact_limit(self):
        with ThreadPoolExecutor(max_workers=12) as pool:
            self.assertEqual(sum(pool.map(attempt, range(30))), 10)

    def test_processes_share_exact_limit(self):
        import multiprocessing

        with ProcessPoolExecutor(
            max_workers=6, mp_context=multiprocessing.get_context("fork")
        ) as pool:
            self.assertEqual(sum(pool.map(attempt, range(30))), 10)

    def test_lock_failure_fails_closed(self):
        with patch("api.login_throttle.os.open", side_effect=OSError("unavailable")):
            throttle = LoginRateThrottle()
            self.assertFalse(throttle.allow_request(None, None))
            self.assertEqual(throttle.wait(), 1)

    def test_lock_timeout_fails_closed(self):
        with (
            patch("api.login_throttle.fcntl.flock", side_effect=BlockingIOError),
            patch("api.login_throttle.time.monotonic", side_effect=[0, 2]),
        ):
            throttle = LoginRateThrottle()
            self.assertFalse(throttle.allow_request(None, None))
            self.assertEqual(throttle.wait(), 1)
