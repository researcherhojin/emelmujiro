# Emelmujiro Strategy & Harness Engineering

This document defines the project's design decisions, their rationale, and LLM agent guardrails. Read this before making architectural changes or large refactors.

## 0. Conceptual Framework (2026-04)

This project's harness is built on three established engineering disciplines. Each layer encompasses the previous one.

| Layer | Question | This project's implementation |
|---|---|---|
| **Prompt Engineering** | "How do I phrase this?" | Conventional commit format, i18n key naming, test descriptions |
| **Context Engineering** | "What does the model need to see?" | `CLAUDE.md` (persistent), `NOTES.md` (session), `.claude/memory/` (cross-session), `grep`/`glob` (just-in-time retrieval) |
| **Harness Engineering** | "What systems wrap the model?" | This document — guides, sensors, failure patterns, principles |

### Guides & Sensors (Fowler, 2026-04)

All defenses in this document are either **guides** (feedforward — steer before action) or **sensors** (feedback — observe and correct after action).

| Type | Mechanism | Examples in this project |
|---|---|---|
| **Guide (feedforward)** | Steer before the agent acts | `CLAUDE.md` rules, `strategy.md` failure patterns, TypeScript types, `.gitignore` credential patterns, ESLint config |
| **Sensor (feedback)** | Observe after the agent acts, enable self-correction | Vitest 100% coverage, `tsc --noEmit`, CI gates (`pr-checks.yml`), Lighthouse assertions, Playwright E2E, Codecov PR comments |
| **Computational** | Deterministic, fast | Linters, type checkers, tests, bundle size check |
| **Inferential** | LLM-based, slower | Code review, this document's failure pattern recognition |

The goal: **when a failure pattern (§5) occurs, add a guide to prevent it or a sensor to catch it — not just documentation.**

---

## 1. Why This Project Exists

**Problem**: AI education/consulting businesses need a professional web presence that demonstrates technical competence — not a generic template site.

**Solution**: A full-stack monorepo (React 19 + Django 6) that serves as both a production portfolio site and a living demonstration of modern web engineering practices. Self-hosted on Mac Mini via Docker + Cloudflare Tunnel to maintain full control over infrastructure.

**Core principle**: The site itself is the proof of competence — 100% test coverage, CI/CD automation, security hardening, i18n, SEO, and performance optimization are all part of the product.

---

## 2. Design Principles

### 2.1 Security by Default

Every auth and data flow decision prioritizes security over convenience.

- **httpOnly cookies** for JWT (not localStorage) — XSS cannot access httpOnly cookies
- **DOMPurify** on all user-generated HTML — no raw `dangerouslySetInnerHTML`
- **uuid4 filenames** for uploads — no user-controlled paths
- **CI script injection prevention** — `${{ }}` never in `run:` blocks
- **127.0.0.1 port binding** — Docker services never exposed publicly

### 2.2 Mechanical Verification (Sensors > Guides > Documentation)

Rules are enforced by systems, not documentation. Documentation is advisory (~80% compliance). Computational sensors (hooks, linters, CI gates) are deterministic (100%). When a rule must hold, make it a sensor — not a guide, not documentation.

| Sensor layer | Enforcement           | What it catches                                         |
| ------------ | --------------------- | ------------------------------------------------------- |
| Pre-commit   | lint-staged (Husky)   | ESLint, Black, Prettier on staged files                 |
| Type system  | `tsc --noEmit`        | Field renames, missing props, type mismatches           |
| CI gates     | pr-checks.yml         | Conventional commits, bundle size < 10MB, security scan |
| Coverage     | 100% target           | Vitest v8 + Django coverage                             |
| E2E          | Playwright 5 profiles | Route changes caught before merge                       |
| Lighthouse   | lighthouserc.js       | Performance, accessibility, SEO regressions             |

### 2.3 i18n as Architecture

Bilingual routing (Korean default, English `/en/` prefix) is not a feature — it's a structural constraint that affects every component.

- Internal links: `useLocalizedPath` hook only (never raw `navigate()` or `<Link>`)
- Data files: getter functions (not module-level constants) so `i18n.t()` resolves at call time
- English text must be shorter than Korean equivalents — abbreviate where needed
- All UI strings through `useTranslation()` or `i18n.t()` — no hardcoded text

### 2.4 Progressive Performance

Performance is not an afterthought — it's built into the build system.

- 7 vendor chunks split by **update frequency** (not size):
  - `react-vendor` (stable months) / `tiptap` (heavy, blog-only) / `i18n` (frequent translation changes)
- SSG prerendering for SEO-critical pages
- Lighthouse CI assertions on every PR
- Bundle budget: < 10MB (enforced in CI)

---

## 3. Key Architecture Decisions

Each decision below has a specific reason. To change it, the reason must be invalidated first.

### 3.1 httpOnly Cookie JWT (not localStorage)

**Decision**: JWT tokens stored in httpOnly cookies with `withCredentials: true` on Axios.

**Why**: localStorage is accessible to any JavaScript on the page. A single XSS vulnerability exposes all tokens. httpOnly cookies are inaccessible to JavaScript — the browser handles them automatically.

**Trade-off**: Requires CORS configuration with credentials, CSRF protection, and a custom DRF authentication class (`authentication.py`) that reads cookies before falling back to Authorization header.

### 3.2 JWT Refresh Queue (Shared Promise)

**Decision**: A single `refreshPromise` variable gates all concurrent 401 retry attempts (`api.ts` response interceptor).

**Why**: Without this, when 3 concurrent requests all get 401, they all call `/auth/refresh/` simultaneously. The server issues a new token on the first call and invalidates the old one — the other 2 refresh calls fail, causing a logout cascade.

**Evidence**: `06e01b1` fixed this exact race condition.

### 3.3 SQLite (not PostgreSQL)

**Decision**: SQLite in production (PostgreSQL available as optional Docker profile).

**Why**: Single-server deployment on Mac Mini. No concurrent write pressure — blog posts are admin-authored, comments are low-volume. SQLite eliminates a service dependency and simplifies backup (single file copy). PostgreSQL profile exists for future scaling.

### 3.4 Provider Order in App.tsx

**Decision**: HelmetProvider > ErrorBoundary > UIProvider > AuthProvider > NotificationProvider > BlogProvider > RouterProvider.

**Why**: Each provider depends on providers above it. ErrorBoundary must wrap everything that can fail during initialization. UIProvider (theme) has no dependencies. AuthProvider needs UI context. NotificationProvider needs Auth (to show auth-related alerts). BlogProvider needs Notification (to show fetch errors). RouterProvider is innermost because pages need all contexts available.

### 3.5 Vite Proxy (not CORS in dev)

**Decision**: Vite dev server proxies `/api` to `http://127.0.0.1:8000`.

**Why**: Eliminates CORS configuration differences between dev and prod. Frontend always calls relative paths (`/api/blog-posts/`). In dev, Vite proxies. In prod, nginx proxies. No environment-specific API URL switching needed.

### 3.6 Single Django App (`api/`)

**Decision**: One Django app instead of splitting into `blog/`, `auth/`, `contact/`, etc.

**Why**: The backend is an API layer for a single frontend — not a platform with independent services. Splitting would add import complexity and migration coordination with no benefit at this scale. If a second frontend consumer appears, reconsider.

---

## 4. Quality Standards

### 4.1 Tests

| Metric            | Target         | Enforcement                                                    |
| ----------------- | -------------- | -------------------------------------------------------------- |
| Frontend coverage | 100%           | Vitest v8, Codecov PR comment                                  |
| Backend coverage  | 100%           | Django coverage, Codecov PR comment                            |
| E2E               | Critical flows | Playwright (5 profiles on main, chromium on PR)                |
| CI pass           | Required       | lint + type-check + test + security + bundle size + Lighthouse |

### 4.2 Code

| Rule                           | Enforcement               |
| ------------------------------ | ------------------------- |
| Conventional commits           | PR check validates format |
| Zero ESLint warnings           | CI fails on any warning   |
| Black + Flake8 (line 120)      | Pre-commit hook + CI      |
| English comments only          | Code review convention    |
| No `window.alert()`/`prompt()` | ESLint + code review      |

### 4.3 Security

| Rule                    | Enforcement                                          |
| ----------------------- | ---------------------------------------------------- |
| No secrets in code      | `.env` gitignored, `ImproperlyConfigured` if missing |
| CI injection prevention | `${{ }}` bound to `env:` first                       |
| Dependency audit        | npm audit + pip audit in PR checks                   |
| File upload validation  | Extension whitelist + MIME check + 5MB limit         |
| Blog HTML sanitization  | `DOMPurify.sanitize()` before render                 |

---

## 5. LLM Harness Engineering

This project uses Claude Code as a primary development tool. The following failure patterns are documented from **real incidents** in this repository, with commit evidence.

### 5.1 Incomplete Refactor

A field, route, or type is renamed in one layer but not propagated to all dependents.

**Real incidents:**

- `feed0e5`: Removed camelCase aliases from backend serializer (`excerpt` -> `description`) but frontend components and mock data still referenced old names
- `092b7ac`: Renamed `/blog` -> `/insights` but E2E tests, MSW handlers, and i18n expectations still used old routes
- `bb0fa6d`: Added `BlogCategory` interface but mock data didn't include `count` field that backend returns

**Defense:**

- Before renaming any field/route/type, run `grep -ri "oldName"` across the **entire** codebase
- Check: source code, test files, mock data, i18n JSON, E2E tests, CLAUDE.md, README
- TypeScript catches prop mismatches but does NOT catch test data shape mismatches or mock responses
- Route changes require updating: router config, nav links, E2E tests, sitemap, prerender list, nginx redirects

### 5.2 Dead Code from Deletion

A component or feature is removed but orphaned references remain.

**Real incidents:**

- `dd9054e`: Deleted old profile tabs but `achievements`, `profileData`, `profilePage` i18n sections remained (0 references)
- `c80260e`: Removed `/about` page but `about` i18n section still in locale files
- `536cee6`: Deleted `FAQSection` but `faq` keys remained in i18n JSON

**Defense:**

- Before deleting any exported symbol, grep for ALL references first
- For i18n keys: search for `t('section.` pattern in code before removing section from JSON
- For components: check lazy imports, route configs, test files, and index re-exports
- Deletions should be a separate commit from additions — easier to review and revert

### 5.3 API Contract Mismatch

Code assumes a response shape that doesn't match what the backend actually returns.

**Real incidents:**

- `bb0fa6d`: Mock categories were `string[]` but backend returns `{ name, slug, count }[]`
- `6b6c6c5`: `_is_valid_ip()` used regex for IPv6 that only matched uncompressed format — `::1` and `2001:db8::1` failed

**Defense:**

- Read the actual serializer or type definition BEFORE writing consuming code
- Mock data must match production schema exactly — add a test that validates mock shape against interface
- For domain logic (IP validation, date parsing), read the authoritative spec, don't guess the format

### 5.4 Environment Config Drift

Environment variables declared in one place don't match what the code actually reads.

**Real incidents:**

- `06e01b1`: Code reads `VITE_GA_TRACKING_ID` but env files declared `VITE_GOOGLE_ANALYTICS_ID` — analytics silently failed
- `6b6c6c5`: `ALLOWED_HOSTS` split by comma without `.strip()` — spaces in env values caused host validation failures
- `8d7d237`: Backend config was split across root `.env` and `backend/.env` without clear ownership boundaries

**Defense:**

- After adding/renaming any env var, grep for the old name to ensure zero remaining references
- All config parsing must normalize whitespace: `[h.strip() for h in value.split(",")]`
- Three env files have distinct scopes — root `.env` (Docker orchestration), `backend/.env` (local dev), `backend/.env.production` (Docker production)

### 5.5 Coverage Theater

Tests pass but don't actually exercise the target code paths.

**Real incidents:**

- `b05ad76`: Defensive branches for impossible states (e.g., `indexOf()` fallback when input is always valid) inflated code without adding safety
- `58c6827`: API interceptor tests covered lines but missed branch paths (concurrent 401 retry, network error vs server error)

**Defense:**

- After writing tests, check coverage report for the **specific lines** you intended to cover
- Don't add defensive code for conditions that can't occur given the design — use `/* v8 ignore next */` with a comment explaining WHY it's unreachable
- Conditional test logic (`if element exists, then assert`) hides failures — assertions must be unconditional

### 5.6 Hallucination (Inventing Things That Don't Exist)

LLM이 존재하지 않는 버전, URL, 함수 시그니처를 자신 있게 사용한다.

**Real incidents:**

- `3644fd6` + `b7e5e8f`: `upload-artifact`를 v7 -> v8로 업그레이드 — v8은 존재하지 않음. 2분 후 revert. **동일한 실수가 28일 전(`ce0c0daf` + revert)에도 발생** — 같은 커밋 메시지 "v8 does not exist yet"
- `86b5bb9`: GitHub Pages actions를 v6로 업그레이드 — v6도 존재하지 않음. 즉시 revert
- `d85481e` + `d64ad5f`: `unread_count` URL을 `unread-count`로 변경 ("DRF는 하이픈 사용") — 22분 후 revert (실제로는 언더스코어 사용)
- `bb0fa6d`: `getBlogCategories()` 리턴 타입을 `string[]`로 작성 — 실제 백엔드는 `{ name, slug, count }[]` 반환

**Defense:**

- 외부 패키지 버전 업그레이드 전, 실제 릴리스 페이지에서 해당 버전 존재 여부를 확인한다
- 함수를 호출하기 전에 시그니처를 읽는다 (`grep -n "def function_name"`)
- "아마 이럴 것이다"로 코드를 쓰지 않는다. 모르면 먼저 읽는다

### 5.7 Confirmation Bias (Same Failure, Same Approach)

같은 문제에 대해 근본 원인을 진단하지 않고 같은 접근을 반복 시도한다.

**Real incidents:**

- Codecov 경로 매핑 실패: 10일간 5번의 서로 다른 시도 (`b0fc3c1` -> `4b7c7e6` -> `6e5ae41` -> `06a1a22` -> `4a48b61`). flag 변경 -> root_dir 설정 -> sed 치환 -> lcov 포맷 변경 -> 또 sed 치환. 각 시도가 이전 시도를 이해하지 않은 채 누적
- E2E 테스트 실패: 35분간 4번의 커밋 (`bd563a5` -> `b49e58f` -> `1f5172a` -> `342408c`). 매번 다른 selector/timeout 전략을 시도했지만 근본 원인(jsdom 환경의 한계)을 진단하지 않음
- upload-artifact v8: 동일한 실수가 28일 간격으로 2번 발생. 학습 없이 반복

**Defense:**

- 같은 접근이 2번 실패하면 **접근 자체를 의심**한다. 3번째 동일 시도는 금지
- 실패 시 "왜 실패했는가"를 먼저 진단한다. 에러 메시지를 읽고, 가정을 검증한다
- 긴 세션에서 `/compact` 후에도 이전 가정이 여전히 유효한지 코드를 다시 읽어 확인한다

### 5.8 Scope Creep (Doing More Than Requested)

요청받은 것 이상을 "개선"하려는 경향. 여러 무관한 변경이 하나의 커밋에 섞인다.

**Real incidents:**

- `23307f6`: 21 files changed — 백엔드 성능 + 번들 최적화 + 접근성 + 코드 정리를 한 커밋에 포함. 캐시 TTL, lazy-loading 전략, 이미지 포맷 변환 등 아키텍처 결정이 리뷰 없이 진행
- `89de130`: 17 files changed — 홈페이지 서비스 + 푸터 모달 + 프로필 + 블로그 UX + CORS 설정 변경을 동시에 처리
- `8d7d237`: 26 files changed — 환경 파일 분리 + 백엔드 유틸리티 추출 + 설정 정리

**Defense:**

- 하나의 작업 요청 = 하나의 관심사. "이것도 같이 하면 좋겠다"는 별도 작업으로 분리한다
- 커밋 하나에 무관한 변경이 섞이면 안 된다. 리뷰가 불가능해진다
- 아키텍처 결정(캐시 전략, lazy-loading, 이미지 포맷)은 명시적 요청이 없으면 하지 않는다

### 5.9 Stale Knowledge (Outdated Assumptions)

학습 cutoff 이후 정보를 모르거나, 버전 번호 패턴으로 존재하지 않는 버전을 추론한다.

**Real incidents:**

- `3644fd6`: `upload-artifact` v7 다음이 v8일 것이라고 추론 — 실제로 v8 미출시. 버전 넘버링 패턴("v7이면 v8이 있을 것")에 의존
- `86b5bb9`: `actions/configure-pages` v6, `actions/deploy-pages` v6으로 업그레이드 시도 — 미출시 버전
- 이 프로젝트는 React 19, Django 6 등 최신 버전을 사용하므로 LLM의 학습 데이터에 없는 API 변경이 있을 수 있음

**Defense:**

- 패키지 업그레이드 시 `npm view <pkg> versions` 또는 GitHub releases 페이지에서 실제 버전을 확인한다
- React 19, Django 6 등 최신 프레임워크의 breaking changes는 공식 문서를 읽고 확인한다
- "v(N-1)이 있으니 v(N)도 있을 것"이라는 추론을 하지 않는다

### 5.10 Monorepo Path Confusion

File paths differ between local dev, CI, and Docker — causing build/coverage failures.

**Real incidents:**

- `8719f97`: Codecov expected `src/components/...` but CI ran from `frontend/`, producing `frontend/src/components/...` paths
- `4a48b61`: Follow-up fix to prefix all coverage paths with `frontend/`

**Defense:**

- Coverage paths in CI must account for the working directory (`cd frontend && npm test` produces paths relative to `frontend/`)
- Codecov, source-map-explorer, and Lighthouse CI all need consistent path configuration
- When adding new CI steps, verify path assumptions against the actual `working-directory` setting

### 5.11 Mechanical Rule Application (Rules Without Context)

규칙을 코드 컨텍스트를 분석하지 않고 기계적으로 적용한다. 결과: 불필요한 수정 → 검증 실패 → 원복.

**Real incidents (2026-04-13):**

- scripts 감사에서 `for pid in $pids` (ports.sh)를 "unquoted variable" 위험으로 보고 → 수정 후 원복. `$pids`는 `lsof -ti:PORT` 출력으로 항상 숫자 PID만 포함 — word splitting/glob 위험 없음
- deploy-webhook.js lock file을 `/tmp/`에서 `backend/logs/`로 이동 → 수정 후 원복. CLAUDE.md `/tmp/` 금지 규칙은 **영속성이 필요한 cron 로그**용. lock 파일은 리부트 시 소멸이 정상 동작
- CSP에서 `cloudflareinsights.com` 제거 시 nginx.conf만 수정하고 index.html 누락 — 동일 설정이 2곳에 존재하는 것을 확인하지 않음 (5.1과 유사하지만 원인이 다름: 리네이밍이 아니라 **규칙의 적용 범위를 확인하지 않음**)

**Defense:**

- 규칙을 적용하기 전에 **해당 규칙이 이 컨텍스트에 적용되는지** 확인한다. "unquoted variable"은 사용자 입력에 위험하지만 숫자 PID에는 해당하지 않는다
- 문서화된 규칙의 **원래 목적**을 이해한다. 규칙의 글자가 아니라 취지를 따른다
- 설정 변경 시 **동일 설정이 다른 위치에도 존재하는지** grep으로 확인한다
- 수정 전에 검증한다. "수정 → 원복" 사이클은 엄밀함의 부재를 의미한다

---

## 6. Harness Principles Summary

Principles 1–3 are **context engineering** (what to read before acting). 4–5 are **sensors** (how to verify after acting). 6–9 are **harness discipline** (how to operate the system).

```
Context (read before acting)
  1. Rename → grep first          Grep the entire codebase for all references before renaming
  2. Delete → grep first          Confirm zero remaining references before deleting any export
  3. Assume → read first          Read the actual definition before using an API, version, or spec

Sensors (verify after acting)
  4. Fix → test after             Run the relevant test suite after every change
  5. 2 failures → change approach If the same fix fails twice, the approach is wrong

Harness discipline (how to operate)
  6. 1 commit = 1 concern         Don't mix unrelated changes in one commit
  7. Verify versions exist        Check the actual release page, don't infer from patterns
  8. Sensor > guide > docs        If a rule must hold 100%, make it a CI gate, not documentation
  9. Rule → context first         Verify a rule applies to this specific context before applying it
```
