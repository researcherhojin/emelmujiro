import time
from datetime import timedelta
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from django.db import DatabaseError
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .models import BlogComment, BlogPost


@override_settings(CSRF_TRUSTED_ORIGINS=["https://emelmujiro.com"])
class CookieSecurityTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="security-user", password="OriginalPassword123!", is_staff=True)
        self.client = APIClient(enforce_csrf_checks=True)
        self.refresh = RefreshToken.for_user(self.user)
        self.client.cookies[settings.JWT_ACCESS_COOKIE] = str(self.refresh.access_token)
        self.client.cookies[settings.JWT_REFRESH_COOKIE] = str(self.refresh)

    def csrf(self):
        response = self.client.get(reverse("csrf-token"), secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn("no-store", response["Cache-Control"])
        self.assertTrue(response.cookies[settings.CSRF_COOKIE_NAME]["httponly"])
        return {"HTTP_X_CSRFTOKEN": response.data["csrfToken"], "HTTP_ORIGIN": "https://emelmujiro.com"}

    def test_cookie_write_requires_csrf_and_trusted_origin(self):
        url = reverse("update_user")
        data = {"first_name": "Updated"}
        self.assertEqual(self.client.put(url, data, format="json").status_code, 403)
        headers = self.csrf()
        self.assertEqual(self.client.put(url, data, format="json", secure=True, **headers).status_code, 200)
        headers["HTTP_ORIGIN"] = "https://untrusted.emelmujiro.com"
        self.assertEqual(self.client.put(url, data, format="json", secure=True, **headers).status_code, 403)
        headers["HTTP_ORIGIN"] = "https://emelmujiro.com"
        headers["HTTP_X_CSRFTOKEN"] = "x" * 64
        self.assertEqual(self.client.put(url, data, format="json", secure=True, **headers).status_code, 403)

    def test_cross_subdomain_form_cannot_create_post(self):
        response = self.client.post(
            reverse("blog-list"),
            {"title": "CSRF", "content": "test", "description": "test", "category": "ai"},
            secure=True,
            HTTP_ORIGIN="https://untrusted.emelmujiro.com",
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(BlogPost.objects.exists())

    def test_login_bootstrap_and_cookie_refresh_with_expired_access(self):
        self.client.cookies.clear()
        credentials = {"username": self.user.username, "password": "OriginalPassword123!"}
        self.assertEqual(self.client.post(reverse("login"), credentials).status_code, 403)
        headers = self.csrf()
        response = self.client.post(reverse("login"), credentials, secure=True, **headers)
        self.assertEqual(response.status_code, 200)
        expired = self.refresh.access_token
        expired.set_exp(lifetime=timedelta(seconds=-1))
        self.client.cookies[settings.JWT_ACCESS_COOKIE] = str(expired)
        self.assertEqual(self.client.post(reverse("token_refresh")).status_code, 403)
        response = self.client.post(reverse("token_refresh"), secure=True, **self.csrf())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get(reverse("get_user")).status_code, 200)
        response = self.client.post(reverse("logout"), secure=True, **self.csrf())
        self.assertEqual(response.status_code, 200)

    def test_header_credentials_do_not_require_csrf(self):
        self.client.cookies.clear()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.refresh.access_token}")
        self.assertEqual(
            self.client.put(reverse("update_user"), {"first_name": "Header"}, format="json").status_code, 200
        )

    def test_body_refresh_token_cannot_bypass_csrf_to_set_cookies(self):
        self.client.cookies.clear()
        response = self.client.post(reverse("token_refresh"), {"refresh": str(self.refresh)})
        self.assertEqual(response.status_code, 403)
        self.assertNotIn(settings.JWT_ACCESS_COOKIE, response.cookies)

    def test_logout_database_failure_clears_cookies_and_reports_unavailable(self):
        with patch("api.auth.RefreshToken") as token:
            token.return_value.blacklist.side_effect = DatabaseError("Database unavailable")
            response = self.client.post(reverse("logout"), secure=True, **self.csrf())
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.cookies[settings.JWT_ACCESS_COOKIE]["max-age"], 0)
        self.assertEqual(response.cookies[settings.JWT_REFRESH_COOKIE]["max-age"], 0)

    def test_password_change_revokes_old_access_and_refresh(self):
        old_access = str(self.refresh.access_token)
        old_refresh = str(self.refresh)
        response = self.client.post(
            reverse("change_password"),
            {"old_password": "OriginalPassword123!", "new_password": "ChangedPassword456!"},
            secure=True,
            **self.csrf(),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get(reverse("get_user")).status_code, 200)
        self.client.cookies[settings.JWT_ACCESS_COOKIE] = old_access
        self.assertEqual(self.client.get(reverse("get_user")).status_code, 401)
        response = self.client.post(
            reverse("token_refresh"), {"refresh": old_refresh}, format="json", secure=True, **self.csrf()
        )
        self.assertEqual(response.status_code, 401)
        self.client.cookies[settings.JWT_REFRESH_COOKIE] = old_refresh
        response = self.client.post(reverse("token_refresh"), secure=True, **self.csrf())
        self.assertEqual(response.status_code, 401)

    def test_legacy_tokens_without_password_claim_are_rejected(self):
        del self.refresh[api_settings.REVOKE_TOKEN_CLAIM]
        self.client.cookies[settings.JWT_ACCESS_COOKIE] = str(self.refresh.access_token)
        self.assertEqual(self.client.get(reverse("get_user")).status_code, 401)
        self.assertEqual(
            self.client.post(
                reverse("token_refresh"), {"refresh": str(self.refresh)}, secure=True, **self.csrf()
            ).status_code,
            401,
        )

    def test_inactive_user_cannot_refresh_with_or_without_rotation(self):
        self.user.is_active = False
        self.user.save()
        for rotate in (True, False):
            with (
                self.subTest(rotate=rotate),
                override_settings(SIMPLE_JWT={**settings.SIMPLE_JWT, "ROTATE_REFRESH_TOKENS": rotate}),
            ):
                self.assertEqual(
                    self.client.post(
                        reverse("token_refresh"), {"refresh": str(self.refresh)}, secure=True, **self.csrf()
                    ).status_code,
                    401,
                )

    def test_forwarded_header_cannot_reset_login_limit(self):
        client = APIClient()
        for index in range(11):
            response = client.post(
                reverse("login"),
                {"username": "absent", "password": "wrong"},
                HTTP_CF_CONNECTING_IP="203.0.113.2",
                HTTP_X_FORWARDED_FOR=f"198.51.100.{index}, 203.0.113.2",
            )
            self.assertEqual(response.status_code, 401 if index < 10 else 429)

    def test_bootstrap_does_not_depend_on_anonymous_drf_quota(self):
        cache.set("throttle_anon_127.0.0.1", [time.time()] * 100, 3600)
        self.csrf()

    def test_local_vite_proxy_login_accepts_frontend_origin(self):
        import runpy

        with patch.dict("os.environ", {"DEBUG": "True", "CSRF_TRUSTED_ORIGINS": "https://emelmujiro.com"}):
            configured = runpy.run_path(str(settings.BASE_DIR / "config/settings.py"))
        with override_settings(CSRF_TRUSTED_ORIGINS=configured["CSRF_TRUSTED_ORIGINS"]):
            self.client.cookies.clear()
            headers = {
                "HTTP_X_CSRFTOKEN": self.client.get(reverse("csrf-token")).data["csrfToken"],
                "HTTP_ORIGIN": "http://localhost:5173",
                "HTTP_HOST": "127.0.0.1:8000",
            }
            response = self.client.post(
                reverse("login"), {"username": self.user.username, "password": "OriginalPassword123!"}, **headers
            )
            self.assertEqual(response.status_code, 200)


class CommentBoundaryTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.draft = BlogPost.objects.create(title="Draft", category="ai", is_published=False)
        self.public = BlogPost.objects.create(title="Public", category="ai")
        self.comment = BlogComment.objects.create(
            post=self.draft, author_name="Author", content="Private comment", ip_address="127.0.0.1"
        )

    def list_url(self, post):
        return reverse("blog-comment-list", kwargs={"post_pk": post.pk})

    def test_anonymous_cannot_read_write_or_like_draft_comments(self):
        self.assertEqual(self.client.get(self.list_url(self.draft)).status_code, 404)
        self.assertEqual(
            self.client.post(
                self.list_url(self.draft), {"post": self.draft.pk, "author_name": "Author", "content": "New"}
            ).status_code,
            404,
        )
        for name, method in (("blog-comment-detail", "get"), ("blog-comment-like", "post")):
            url = reverse(name, kwargs={"post_pk": self.draft.pk, "pk": self.comment.pk})
            self.assertEqual(getattr(self.client, method)(url).status_code, 404)
        self.assertEqual(BlogComment.objects.count(), 1)

    def test_public_comments_and_staff_draft_access_work(self):
        response = self.client.post(
            self.list_url(self.public), {"post": self.public.pk, "author_name": "Author", "content": "Public"}
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(self.client.get(self.list_url(self.public)).data), 1)
        staff = User.objects.create_user(username="moderator", is_staff=True)
        self.client.force_authenticate(staff)
        self.assertEqual(len(self.client.get(self.list_url(self.draft)).data), 1)

    def test_rejects_cross_post_parent_and_mismatched_post(self):
        data = {"post": self.public.pk, "author_name": "Author", "content": "Reply", "parent": self.comment.pk}
        self.assertEqual(self.client.post(self.list_url(self.public), data).status_code, 400)
        data.pop("parent")
        data["post"] = self.draft.pk
        self.assertEqual(self.client.post(self.list_url(self.public), data).status_code, 400)

    def test_legacy_cross_post_reply_is_not_serialized(self):
        parent = BlogComment.objects.create(post=self.public, author_name="Author", content="Public")
        self.comment.parent = parent
        self.comment.save()
        self.assertEqual(self.client.get(self.list_url(self.public)).data[0]["replies"], [])


class ProductionCorsTests(TestCase):
    def test_production_filters_development_origins(self):
        import runpy

        with patch.dict(
            "os.environ",
            {
                "DEBUG": "False",
                "CORS_ALLOWED_ORIGINS": "http://localhost:5173,https://localhost,https://emelmujiro.com",
            },
        ):
            configured = runpy.run_path(str(settings.BASE_DIR / "config/settings.py"))
        self.assertEqual(configured["CORS_ALLOWED_ORIGINS"], ["https://emelmujiro.com"])
