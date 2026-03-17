/**
 * Cloudflare Worker — Maintenance Page Fallback
 *
 * Proxies requests to the origin (Mac Mini via Cloudflare Tunnel).
 * When the origin is unreachable (server down, 5xx error), returns
 * a branded maintenance page instead of the default Cloudflare error.
 *
 * Deploy: Cloudflare Dashboard → Workers & Pages → Create Worker
 * Routes: emelmujiro.com/* and api.emelmujiro.com/*
 */

export default {
  async fetch(request) {
    try {
      const response = await fetch(request);

      if (response.status >= 500) {
        return maintenancePage(request);
      }

      return response;
    } catch (_e) {
      // Origin unreachable (tunnel down, network error)
      return maintenancePage(request);
    }
  },
};

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.hostname.startsWith('api.');
}

function maintenancePage(request) {
  // API requests get a JSON response
  if (isApiRequest(request)) {
    return new Response(
      JSON.stringify({
        error: 'Service temporarily unavailable',
        message: '서비스 점검 중입니다. 잠시 후 다시 시도해 주세요.',
        retry_after: 300,
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Retry-After': '300',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': 'https://emelmujiro.com',
        },
      }
    );
  }

  // Browser requests get the HTML page
  return new Response(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Retry-After': '300',
      'Cache-Control': 'no-store',
    },
  });
}

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>서비스 점검 중 | 에멜무지로</title>
  <meta name="robots" content="noindex" />
  <meta name="theme-color" content="#111827" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #ffffff;
      --bg-subtle: #f9fafb;
      --text: #111827;
      --text-secondary: #6b7280;
      --accent: #2563eb;
      --accent-hover: #1d4ed8;
      --divider: #111827;
      --btn-bg: #111827;
      --btn-text: #ffffff;
      --btn-hover: #1f2937;
      --border: #e5e7eb;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0a0a0b;
        --bg-subtle: #18181b;
        --text: #f9fafb;
        --text-secondary: #9ca3af;
        --accent: #3b82f6;
        --accent-hover: #2563eb;
        --divider: #f9fafb;
        --btn-bg: #f9fafb;
        --btn-text: #0a0a0b;
        --btn-hover: #e5e7eb;
        --border: #27272a;
      }
    }

    body {
      font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont,
        system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo',
        'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji',
        'Segoe UI Symbol', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      text-align: center;
      max-width: 32rem;
      width: 100%;
    }

    .status-code {
      font-size: clamp(5rem, 15vw, 9rem);
      font-weight: 900;
      letter-spacing: -0.05em;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .divider {
      width: 6rem;
      height: 0.25rem;
      background: var(--divider);
      border-radius: 9999px;
      margin: 0 auto 2rem;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .description {
      color: var(--text-secondary);
      font-size: 1.125rem;
      line-height: 1.75;
      margin-bottom: 0.5rem;
    }

    .description-en {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 2.5rem;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }

    @media (min-width: 640px) {
      .actions { flex-direction: row; justify-content: center; }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.9375rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn:hover { transform: scale(1.05); }

    .btn-primary {
      background: var(--btn-bg);
      color: var(--btn-text);
    }

    .btn-primary:hover { background: var(--btn-hover); }

    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 2px solid var(--border);
    }

    .btn-secondary:hover { border-color: var(--text); }

    .brand {
      margin-top: 3rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .brand a {
      color: var(--accent);
      text-decoration: none;
    }

    .brand a:hover { text-decoration: underline; }

    .bg-decor {
      position: fixed;
      background: var(--bg-subtle);
      z-index: -1;
    }

    .bg-decor-left { top: 0; left: 0; width: 33%; height: 100%; }
    .bg-decor-right { bottom: 0; right: 0; width: 33%; height: 50%; }

    /* Refresh icon */
    .icon { width: 1.25rem; height: 1.25rem; }
  </style>
</head>
<body>
  <div class="bg-decor bg-decor-left"></div>
  <div class="bg-decor bg-decor-right"></div>

  <main class="container">
    <div class="status-code">503</div>
    <div class="divider"></div>

    <h1>서비스 점검 중입니다</h1>
    <p class="description">잠시 후 다시 방문해 주세요.<br/>더 나은 서비스로 곧 찾아뵙겠습니다.</p>
    <p class="description-en">Service is temporarily unavailable. Please try again later.</p>

    <div class="actions">
      <button class="btn btn-primary" onclick="location.reload()">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        새로고침
      </button>

      <a class="btn btn-secondary" href="mailto:researcherhojin@gmail.com">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        문의하기
      </a>
    </div>

    <p class="brand">에멜무지로 — AI 교육 & 컨설팅 | <a href="https://emelmujiro.com">emelmujiro.com</a></p>
  </main>
</body>
</html>`;
