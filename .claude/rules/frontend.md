---
paths:
  - 'frontend/**'
---

<!-- Path-scoped rule: loads when Claude reads files under frontend/. Cross-cutting build/deploy/CI/dependency rules stay in root CLAUDE.md. -->

# Frontend rules

## Architecture

Invariants only. Grep the code for everything else.

- **i18n routing**: Korean default (no prefix: `/profile`), English `/en/profile`. Every internal path goes through `localizedPath()` from the `useLocalizedPath` hook — `<Link to={localizedPath(…)}>` and `navigate(localizedPath(…))` are the pattern, a bare string path is the bug (`navigate(-1)` is fine). Non-React data files must use getter functions (not module-level constants) so `i18n.t()` resolves at call time.
- **Provider order** (`App.tsx`): HelmetProvider → ErrorBoundary → UIProvider → AuthProvider → NotificationProvider → BlogProvider → RouterProvider.
- **`index.html`'s pre-load error handler only records, never renders.** `window.onerror` and the unhandled-rejection listener push into `window.__errors`; the one fallback is the 5 s `__appLoaded` timeout, which displays them. Rendering from the handler replaced `#root` on any error, including code the browser injects into every page — Brave on iOS throws `window.ethereum.selectedAddress = undefined` — and tore down pages that were loading fine (fixed 2026-10-04, `ff788880`). `e2e/error-states.spec.ts` asserts both halves: injected errors leave the nav in place, and aborting every `/assets/*.js` still shows the timeout fallback.
- **Auth**: JWT in httpOnly cookies (not localStorage). `auth_hint` flag in localStorage skips `getUser()` on mount when unset — prevents 401 spam.
- **State**: React Context only (`UIContext`, `AuthContext`, `BlogContext`, `NotificationContext`). No Redux or external state libs.
- **HTTP**: `services/api.ts` (Axios) with JWT-refresh interceptors. Tests mock `services/api` per file (11 files; 2 mock `axios` directly, measured 2026-10-06) — **no MSW server** (scaffold removed 2026-04-11).
- **Bundle splitting**: 7 vendor chunks in `vite.config.ts` (`react-vendor`, `ui-vendor`, `i18n`, `sentry`, `http-vendor`, `dompurify`, `tiptap`). Sentry lazy-loaded: `utils/sentry.ts` is the shim that dynamically imports `sentry-impl.ts`, the implementation that becomes the `sentry` chunk — 0 bytes on homepage. Prefer Tailwind keyframe animations over re-introducing a JS animation lib.
- **Blog snake_case**: All BlogPost fields are `description` / `date` / `is_published` / `view_count` / `image_url` — no camelCase aliases in serializer. Public routes use `/insights/:slug`; internal API stays at `/api/blog-posts/` with DRF router `basename="blog"`. Nginx 301s `/blog/*` → `/insights/*`. `content_html` (TipTap) **must** be `DOMPurify.sanitize()`-ed before `dangerouslySetInnerHTML`.
- **Contact email lockstep**: `contact@emelmujiro.com` lives in **7 source files** — `frontend/src/utils/constants.ts` (`CONTACT_EMAIL` fallback), `i18n/locales/ko.json` + `en.json`, `backend/config/settings.py` (`ADMIN_EMAIL` default), `backend/api/swagger.py` (`CONTACT_EMAIL` default), `CONTRIBUTING.md`, and `frontend/public/.well-known/security.txt`. Update all 7 together. **`security.txt` is the one that bites**: security researchers fetch it from a well-known URL, so a missed rename publishes a wrong security contact. Four more tracked files mention it and a rename must follow three of them: the comment in `frontend/.env.production` (`VITE_CONTACT_EMAIL=` is empty), the Cloudflare email-obfuscation `sed` in root `CLAUDE.md`'s Lighthouse paragraph, and this rule; `CHANGELOG.md` is history and stays.
- **Privacy schema lockstep**: When the Google Form schema changes (fields added/removed/retitled), update `privacy.dataCollection.content` in `ko.json` + `en.json` and bump the effective date in `PrivacyPolicyPage.tsx` in the same commit — Korean PIPA Article 30 requires the published policy to match actual collection.

## UI Conventions

Principles, not specifics. UI strings live in `frontend/src/i18n/locales/`; CSS classes live in components. Don't mirror them here.

- **Hero layout**: Centered (no left-right grid), dark-on-light / light-on-dark, no badge. Mobile: padding-based; desktop: flex-centered full-height.
- **Homepage section order**: Hero → Logos → Services → Testimonials → CTA. Alternating bg colors for rhythm. Social proof before value prop; customer proof before conversion.
- **Scroll carousels**: `w-max` on the animated flex container (required for `translateX` % to use total content width, not viewport). 2x copies looped with `translateX(-50%)` — math is `-((1/N) × 100%)` for N copies (2x keeps homepage DOM under Lighthouse's 800-node threshold — measured 2026-10-06: the prerendered homepage carries **616** elements in `<body>`, ko and en alike, 687 in the whole document). Item gap on the item (`mx-2`/`px-8`), NOT `gap-*` on flex container — loop math breaks otherwise. Pause via CSS group-hover + JS `touchstart`/`touchend` for mobile resume. `prefers-reduced-motion: reduce` overrides keep carousels at original speed — do NOT use `motion-reduce:!animate-none` (kills animations on Windows where reduced-motion is often default-on). Both testimonial rows must have **equal item counts** to keep equal visual speed.
- **Services modal**: Cards open `ServiceModal` (also used by Footer). State local to ServicesSection, not UIContext. Mobile nav via dot indicators only (arrows hidden).
- **Mobile responsive**: Page heroes use padding-based layout (NOT `min-h` + flex centering on mobile). Three-step text size progression (mobile/sm/md) to avoid harsh 639→640px jumps. Korean text uses `break-keep` to prevent mid-word breaks; mobile-only line breaks use `<br className="sm:hidden" />`. English i18n strings must be shorter than Korean equivalents — abbreviate org names (MOEL, KALIS, KETI), `#` instead of "Cohort".
- **Insights branding**: User-facing text says "인사이트"/"Insights" (not "블로그"/"Blog"). Section label "INSIGHTS" (not "TECH BLOG"). Internal code keeps `blog` names/paths — only display text changed.
- **Nav order**: 강의이력 → 인사이트 (teaching history first, blog second). Footer menu label is "강의이력".
- **Privacy policy**: 13 sections per Korean PIPA Article 30. Self-hosted Umami counts as no external delegation; Sentry counts as delegation. ToC anchor links, bilingual. **It over-discloses on purpose**: it names Sentry as a processor, but production ships no DSN (`VITE_SENTRY_DSN` empty, `VITE_ENABLE_SENTRY` unset, so `initSentry()` returns early; verified in the live bundle 2026-09-28). Do not read the policy as evidence that Sentry is running.

**Removed pages — do NOT re-add**:

- **About** — route, component, lazy import, sitemap entry, prerender list, StructuredData breadcrumb all deleted.
- **Share** — frontend-only with no backend, no real functionality. Nginx 301 redirects `/share` → `/` and `/en/share` → `/en`.
- **FAQSection** component — removed from homepage. `faq` i18n keys also removed.

## Testing

Global mocks in `setupTests.ts` (do NOT re-mock): `react-i18next` (`t: key => key`, `language: 'ko'`, `Trans` passthrough), `lucide-react`, `react-helmet-async`, browser APIs. A test that needs a custom `t()` re-mocks `react-i18next` locally (16 files do, measured 2026-10-06); copy the shape from `setupTests.ts`, not from memory.

Non-React: `vi.mock('../../i18n', () => ({ default: { t: (key: string) => key, language: 'ko' } }));`

Use `renderWithProviders` from `test-utils/` for component tests needing context (wraps MemoryRouter + providers). E2E in `frontend/e2e/` runs on 5 profiles (chromium, firefox, webkit, mobile chrome, mobile safari); PR checks run chromium only.

E2E runs against the **production build**, not the dev server — see `Constraints` → E2E target in root `CLAUDE.md` for the two traps (`vite preview` serves the homepage snapshot for every route; a plain `build` calls the live API). Shared helpers live in `e2e/helpers.ts`: `openNav` (nav landmark + mobile sheet, Gotcha #9), `NAV_LABELS` (ko/en pair), `swipeHorizontal` (cross-engine touch swipe — the `Touch` constructor is Chromium-only). Because the suite serves prerendered HTML, specs may assert the real production contract: unknown URLs return `404` with the SPA shell, and each helmet-managed head tag must appear exactly once (`createRoot` cannot adopt prerendered tags, so `SEOHelmet` drops the superseded ones).

**Coverage gate** (`codecov.yml`): **two** project statuses, not one — `frontend` (flag `frontend`, paths `frontend/src`) and `backend` (flag `backend`, paths `backend/api`), each `target: 100%, threshold: 1%` (effective floor 99 %); plus one `patch` default `target: 90%, threshold: 3%` (effective floor 87 %). The 100 % number is the aim; the threshold is what actually fails Codecov. Because the two project statuses are flag-scoped, a frontend-only PR cannot be rescued by backend coverage or vice versa.

## Security

- **Blog HTML**: `content_html` (TipTap) is always sanitized with `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`. Comments render as plain text only. Image right-click/drag prevention uses shared `preventImageAction` from `utils/imageUtils.ts`.
