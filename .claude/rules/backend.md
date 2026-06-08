---
paths:
  - 'backend/**'
---

<!-- Path-scoped rule: loads when Claude reads files under backend/. Cross-cutting build/deploy/CI/dependency rules stay in root CLAUDE.md. -->

# Backend rules

## Constants

`api/constants.py` centralizes `ONE_HOUR`, `ONE_DAY`, `SPAM_KEYWORDS`, `SPAM_THRESHOLD`, `MAX_FAILED_CONTACT_ATTEMPTS`, `is_spam()`, and cache keys (`CACHE_BLOG_CATEGORIES`, `CACHE_BLOG_POST_LIST`, `CACHE_ADMIN_STATS`). Import from here — do NOT re-define time constants or cache keys in views/middleware. `django-extensions` + `ipython` are dev-only (`uv sync --extra dev`).

## Utilities

`api/utils.py` has `get_client_ip()`, `_is_valid_ip()`, `toggle_like()`. IP extraction is shared by views and middleware — import from utils, not views.

## Testing

**Backend test output is intentionally noisy** — `ERROR`/`WARNING` lines come from negative-path tests (XSS/SQL/path-traversal middleware, SMTP/DB failure paths, JWT invalid tokens, reCAPTCHA fallbacks, blocked IPs). Trust `Ran N tests OK` + exit code 0, not the absence of log lines.

## Security

- **File uploads**: Backend uses `uuid4` filenames (no user-supplied paths). Validated against extension whitelist + MIME type + 5 MB limit.
