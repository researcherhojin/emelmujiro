# cspell:ignore reviewstaff reviewadmin otheradmin reviewpassworduser
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Contact


class AdminAccountBoundaryTests(TestCase):
    def setUp(self):
        cache.clear()
        self.staff = User.objects.create_user("reviewstaff", is_staff=True)
        self.admin = User.objects.create_superuser("reviewadmin", "admin@example.com", "OriginalPassword123!")
        self.regular = User.objects.create_user("regular")
        self.client = APIClient()
        self.client.force_authenticate(self.staff)

    def test_staff_cannot_modify_superuser(self):
        for data in ({"is_active": False}, {"first_name": "Changed"}):
            with self.subTest(data=data):
                response = self.client.patch(reverse("admin-user-detail", args=[self.admin.pk]), data, format="json")
                self.assertEqual(response.status_code, 403)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_active)
        self.assertEqual(self.admin.first_name, "")

    def test_staff_cannot_delete_superuser(self):
        response = self.client.delete(reverse("admin-user-detail", args=[self.admin.pk]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.admin.pk).exists())

    def test_staff_can_read_superuser(self):
        response = self.client.get(reverse("admin-user-detail", args=[self.admin.pk]))
        self.assertEqual(response.status_code, 200)

    def test_staff_can_manage_regular_user(self):
        url = reverse("admin-user-detail", args=[self.regular.pk])
        response = self.client.patch(url, {"is_active": False}, format="json")
        self.assertEqual(response.status_code, 200)
        self.regular.refresh_from_db()
        self.assertFalse(self.regular.is_active)
        self.assertEqual(self.client.delete(url).status_code, 204)

    def test_superuser_can_manage_another_superuser(self):
        other_admin = User.objects.create_superuser("otheradmin", "other@example.com", "OriginalPassword123!")
        self.client.force_authenticate(self.admin)
        url = reverse("admin-user-detail", args=[other_admin.pk])
        self.assertEqual(self.client.patch(url, {"is_active": False}, format="json").status_code, 200)
        other_admin.refresh_from_db()
        self.assertFalse(other_admin.is_active)
        self.assertEqual(self.client.delete(url).status_code, 204)


class PasswordPolicyTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("reviewpassworduser", password="OriginalPassword123!")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_configured_validators_reject_weak_passwords_without_mutation(self):
        for password in ("123456789012", "password123456", "reviewpassworduser"):
            with self.subTest(password=password):
                response = self.client.post(
                    reverse("change_password"),
                    {"old_password": "OriginalPassword123!", "new_password": password},
                    format="json",
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.data)
                self.assertNotIn(settings.JWT_ACCESS_COOKIE, response.cookies)
                self.assertNotIn(settings.JWT_REFRESH_COOKIE, response.cookies)
                self.user.refresh_from_db()
                self.assertTrue(self.user.check_password("OriginalPassword123!"))

    def test_valid_password_changes_and_issues_cookies(self):
        password = "River!Quartz-47-Maple"
        response = self.client.post(
            reverse("change_password"),
            {"old_password": "OriginalPassword123!", "new_password": password},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(password))
        self.assertIn(settings.JWT_ACCESS_COOKIE, response.cookies)
        self.assertIn(settings.JWT_REFRESH_COOKIE, response.cookies)


@override_settings(DEBUG=False, RECAPTCHA_PRIVATE_KEY="review-only-key")
class VerifiedContactTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.data = {
            "name": "Review User",
            "email": "review@example.com",
            "subject": "Review contact subject",
            "message": "Review message with sufficient length.",
            "inquiry_type": "general",
            "recaptcha_token": "verified-test-token",
        }

    @patch("api.views.send_mail")
    @patch("api.views.requests.post")
    def test_verified_contact_is_saved_and_email_sent(self, verify, send_mail):
        verify.return_value.status_code = 200
        verify.return_value.json.return_value = {"success": True}
        response = self.client.post(reverse("contact-create"), self.data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Contact.objects.count(), 1)
        self.assertEqual(Contact.objects.get().email, self.data["email"])
        self.assertNotIn("recaptcha_token", response.data)
        self.assertEqual(verify.call_args.kwargs["data"]["response"], self.data["recaptcha_token"])
        send_mail.assert_called_once()

    @patch("api.views.send_mail")
    @patch("api.views.requests.post")
    def test_invalid_token_is_not_saved(self, verify, send_mail):
        verify.return_value.status_code = 200
        verify.return_value.json.return_value = {"success": False}
        response = self.client.post(reverse("contact-create"), self.data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Contact.objects.exists())
        send_mail.assert_not_called()


class AuthInputTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            "input-user", email="original@example.com", password="OriginalPassword123!"
        )
        self.client = APIClient()

    def test_login_rejects_non_string_and_oversized_input(self):
        for value in (123, True, [], {}, "x" * 4097):
            for field in ("username", "password"):
                with self.subTest(field=field, value=value):
                    cache.clear()
                    data = {"username": "input-user", "password": "OriginalPassword123!", field: value}
                    self.assertEqual(self.client.post(reverse("login"), data, format="json").status_code, 400)

    def test_ambiguous_email_login_is_rejected(self):
        User.objects.create_user("duplicate-user", email=self.user.email, password="OriginalPassword123!")
        response = self.client.post(
            reverse("login"), {"username": self.user.email, "password": "OriginalPassword123!"}, format="json"
        )
        self.assertEqual(response.status_code, 401)

    def test_invalid_profile_update_does_not_mutate_user(self):
        self.client.force_authenticate(self.user)
        for data in ({"email": "not-an-email"}, {"first_name": 123}, {"last_name": "x" * 151}, {"email": None}):
            with self.subTest(data=data):
                self.assertEqual(self.client.put(reverse("update_user"), data, format="json").status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "original@example.com")
        self.assertEqual(self.user.first_name, "")
        self.assertEqual(self.user.last_name, "")

    def test_duplicate_email_is_case_insensitive(self):
        User.objects.create_user("other-user", email="taken@example.com")
        self.client.force_authenticate(self.user)
        response = self.client.put(reverse("update_user"), {"email": "TAKEN@example.com"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_password_change_rejects_non_string_values(self):
        self.client.force_authenticate(self.user)
        for field in ("old_password", "new_password"):
            data = {"old_password": "OriginalPassword123!", "new_password": "ValidPassword123!", field: 123}
            self.assertEqual(self.client.post(reverse("change_password"), data, format="json").status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OriginalPassword123!"))

    def test_refresh_rejects_non_string_value(self):
        response = self.client.post(reverse("token_refresh"), {"refresh": 123}, format="json")
        self.assertEqual(response.status_code, 400)


@override_settings(CSRF_TRUSTED_ORIGINS=["https://emelmujiro.com"])
class ExpiredLogoutTests(TestCase):
    def setUp(self):
        from rest_framework_simplejwt.tokens import RefreshToken

        cache.clear()
        self.user = User.objects.create_user("logout-user", password="OriginalPassword123!")
        self.refresh = RefreshToken.for_user(self.user)
        self.client = APIClient(enforce_csrf_checks=True)
        self.client.cookies[settings.JWT_REFRESH_COOKIE] = str(self.refresh)

    def headers(self):
        response = self.client.get(reverse("csrf-token"), secure=True)
        return {"HTTP_X_CSRFTOKEN": response.data["csrfToken"], "HTTP_ORIGIN": "https://emelmujiro.com"}

    def test_logout_with_expired_access_revokes_refresh_and_clears_cookies(self):
        from datetime import timedelta

        access = self.refresh.access_token
        access.set_exp(lifetime=timedelta(seconds=-1))
        self.client.cookies[settings.JWT_ACCESS_COOKIE] = str(access)
        response = self.client.post(reverse("logout"), secure=True, **self.headers())
        self.assertEqual(response.status_code, 200)
        for name in (settings.JWT_ACCESS_COOKIE, settings.JWT_REFRESH_COOKIE):
            self.assertEqual(response.cookies[name]["max-age"], 0)
        response = self.client.post(
            reverse("token_refresh"), {"refresh": str(self.refresh)}, secure=True, **self.headers()
        )
        self.assertEqual(response.status_code, 401)

    def test_logout_requires_csrf_and_trusted_origin(self):
        from rest_framework_simplejwt.tokens import RefreshToken

        self.assertEqual(self.client.post(reverse("logout"), secure=True).status_code, 403)
        headers = self.headers()
        headers["HTTP_ORIGIN"] = "https://untrusted.example.com"
        self.assertEqual(self.client.post(reverse("logout"), secure=True, **headers).status_code, 403)
        RefreshToken(str(self.refresh))

    def test_logout_without_cookies_is_idempotent(self):
        self.client.cookies.clear()
        for _ in range(2):
            response = self.client.post(reverse("logout"), secure=True, **self.headers())
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.cookies[settings.JWT_REFRESH_COOKIE]["max-age"], 0)

    def test_cookie_token_takes_priority_over_body_token(self):
        from rest_framework_simplejwt.exceptions import TokenError
        from rest_framework_simplejwt.tokens import RefreshToken

        other = RefreshToken.for_user(self.user)
        response = self.client.post(reverse("logout"), {"refresh": str(other)}, secure=True, **self.headers())
        self.assertEqual(response.status_code, 200)
        with self.assertRaises(TokenError):
            RefreshToken(str(self.refresh))
        RefreshToken(str(other))
