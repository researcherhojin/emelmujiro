---
paths:
  - 'backend/**'
---

<!-- Path-scoped rule: loads when Claude reads files under backend/. Cross-cutting build/deploy/CI/dependency rules stay in root CLAUDE.md. -->

# Backend rules

## Architecture

Invariants only. Grep the code for everything else. Single app `api/`; `config/` holds settings and the root URLconf.

- **The view layer is split four ways, not one `views.py`**: `views.py` (public API — blog, comments, image upload, categories, contact, newsletter, notifications, `health_check`, plus 4 of the 5 throttle classes), `admin_views.py` (10 admin endpoints), `auth.py` (`login` / `logout` / `get_user` / `update_user` / `change_password` / `token_refresh` + the `_set_jwt_cookies` / `_clear_jwt_cookies` helpers), and `authentication.py` (`CookieJWTAuthentication`). New endpoints go in the module matching their audience — do not grow `views.py` into an admin or auth home.
- **Auth is cookie-first, header-fallback**: `CookieJWTAuthentication` reads `settings.JWT_ACCESS_COOKIE` (`"access_token"`, refresh is `"refresh_token"`) and only falls back to the `Authorization` header when the cookie is absent or invalid. Tests and API clients can use either; the browser always uses the cookie. Never move token issuance out of `auth.py`'s cookie helpers — that's the one place `httpOnly`/`SameSite` flags are set.
- **Middleware position is load-bearing** (`config/settings.py` `MIDDLEWARE`): `RequestSecurityMiddleware` runs **before** Session/CSRF/Authentication so it can reject malicious patterns and blocked IPs without a DB session; `ContentSecurityMiddleware` and `APIResponseTimeMiddleware` run **last** so they see the final response. Reordering these silently changes what they can inspect.
- **`api/urls.py` ordering is a collision guard**: `blog-posts/upload-image/` and the nested `blog-posts/<post_pk>/comments/…` paths are registered **before** `include(router.urls)`, because the `DefaultRouter` detail route `blog-posts/{id}/` would otherwise swallow them. Add new `blog-posts/…` sub-paths above the `include`, never below. Router basenames: `blog` (not `blogpost`) and `notification`.
- **10 models** in `api/models.py`: `BlogPost`, `BlogLike`, `BlogComment`, `CommentLike`, `Contact`, `ContactAttempt`, `SiteVisit`, `Notification`, `NotificationPreference`, `NewsletterSubscription`.
- **Throttle rates are declared in two places and the inline `rate` wins.** `REST_FRAMEWORK.DEFAULT_THROTTLE_RATES` holds `anon` 100/h, `user` 1000/h, `login` 10/h, `contact` 5/h, `newsletter` 3/h, `admin` 120/h — but `ContactRateThrottle`, `CommentRateThrottle` and `AdminRateThrottle` in `views.py` each set an inline `rate`, which overrides the settings entry, so editing settings alone changes nothing for those three. `comment` has no settings entry at all; its 10/h lives only on the class. `LoginRateThrottle` (`auth.py`) and `NewsletterRateThrottle` (`views.py`) deliberately omit `rate` so settings is their single source of truth — **prefer that shape for new throttles.** `health_check` is exempt on purpose (`@throttle_classes([])`) because Docker probes it every 30s.
- **A scope only exists if a throttle class declares it.** `newsletter: 3/hour` was dead config until 2026-08-20: `NewsletterView` used a bare `AnonRateThrottle`, whose scope is `anon`, so signups silently got the 100/h anon bucket. Adding a rate to `DEFAULT_THROTTLE_RATES` does nothing on its own. Two traps this left behind, both still live: `@override_settings(REST_FRAMEWORK={...DEFAULT_THROTTLE_RATES...})` in tests **does not disable a throttle** — DRF binds `SimpleRateThrottle.THROTTLE_RATES` as a class attribute at import, so the override never reaches it; the several test classes that pass `"newsletter": None` are decorative. The pattern that actually works here is `cache.clear()` in `setUp` (see `ContactAPITestCase`, `NewsletterAPITestCase`) — a throttled endpoint's tests share the counter across the class otherwise. Local dev (`DEBUG=True`) runs without throttling — see root `CLAUDE.md` → `Constraints` → Local dev vs Docker.

## Constants

`api/constants.py` centralizes `ONE_HOUR`, `ONE_DAY`, `SPAM_KEYWORDS`, `SPAM_THRESHOLD`, `MAX_FAILED_CONTACT_ATTEMPTS`, `is_spam()`, and cache keys (`CACHE_BLOG_CATEGORIES`, `CACHE_BLOG_POST_LIST`, `CACHE_ADMIN_STATS`). Import from here — do NOT re-define time constants or cache keys in views/middleware. `django-extensions` + `ipython` are dev-only (`uv sync --extra dev`).

## Utilities

`api/utils.py` has `get_client_ip()`, `_is_valid_ip()`, `toggle_like()`. IP extraction is shared by views and middleware — import from utils, not views.

## Testing

**Backend test output is intentionally noisy** — `ERROR`/`WARNING` lines come from negative-path tests (XSS/SQL/path-traversal middleware, SMTP/DB failure paths, JWT invalid tokens, reCAPTCHA fallbacks, blocked IPs). Trust `Ran N tests OK` + exit code 0, not the absence of log lines.

## Security

- **File uploads**: Backend uses `uuid4` filenames (no user-supplied paths). Validated against extension whitelist + MIME type + 5 MB limit.
