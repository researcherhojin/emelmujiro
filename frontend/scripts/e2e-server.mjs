/**
 * Serves `build/` the way production nginx does, for the E2E suite.
 *
 * The suite used to run against `npm run dev`, which transforms modules on
 * demand and drops lazy-chunk requests under parallel load — the browser
 * reports `TypeError: Importing a module script failed`, React's lazy() rejects,
 * and the ErrorBoundary's fullscreen overlay swallows clicks. Serving static
 * files removes that failure class and tests the artifact users actually get,
 * including the SSG prerendered HTML.
 *
 * `vite preview` is NOT a substitute: it answers `/contact` with
 * `build/index.html` via SPA fallback instead of `build/contact/index.html`, so
 * every prerendered route silently serves the homepage snapshot.
 *
 * Mirrors `nginx.conf`. Keep the two in sync — each rule below cites its
 * counterpart.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUILD_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'build');
// 4180, not 5173 — the Vite dev server owns 5173, and playwright.config.ts sets
// `reuseExistingServer` locally, so sharing the port made `playwright test`
// silently attach to a running `npm run dev` and skip building at all. The dev
// server implements none of the nginx behavior below, so error-states.spec.ts
// (404) and navigation.spec.ts (/blog + trailing-slash 301s) failed against it.
// Not 4173 either: lighthouserc.js runs `vite preview` there, and that fallback
// answers every route with the homepage snapshot.
const PORT = Number(process.env.E2E_PORT || 4180);
const API_TARGET = process.env.E2E_API_TARGET || 'http://127.0.0.1:8000';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

/** nginx `location ~ ^/(en/)?(insights/.+|login)$` — routes prerender skips. */
const SPA_FALLBACK = /^\/(en\/)?(insights\/.+|login)$/;
/** nginx `location ~ ^/blog(.*)$` and `^/en/blog(.*)$`. */
const BLOG_REDIRECT = /^\/(en\/)?blog(.*)$/;
/** nginx `location = /share` and `= /en/share`. */
const SHARE_REDIRECT = /^\/(en\/)?share$/;
/** nginx `location ~ ^/(?!api/|umami/)(.+)/$` — trailing-slash 301. */
const TRAILING_SLASH = /^\/(?!api\/|umami\/)(.+)\/$/;

const resolveFile = async (urlPath) => {
  // Reject traversal before touching the filesystem.
  const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(BUILD_DIR, safe);
  if (!candidate.startsWith(BUILD_DIR)) return null;
  try {
    return (await stat(candidate)).isFile() ? candidate : null;
  } catch {
    return null;
  }
};

const send = async (res, status, file) => {
  const body = await readFile(file);
  res.writeHead(status, {
    'content-type': MIME[extname(file)] || 'application/octet-stream',
    'cache-control': 'no-cache, must-revalidate',
  });
  res.end(body);
};

const proxyApi = (req, res) => {
  const target = new URL(req.url, API_TARGET);
  const upstream = new URL(API_TARGET);
  const proxied = {
    hostname: upstream.hostname,
    port: upstream.port,
    path: target.pathname + target.search,
    method: req.method,
    headers: { ...req.headers, host: upstream.host },
  };
  import('node:http').then(({ request }) => {
    const proxyReq = request(proxied, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    });
    // The backend is optional for E2E; the app renders its own error states.
    proxyReq.on('error', () => {
      res.writeHead(502, { 'content-type': 'application/json' });
      res.end('{"detail":"backend not running"}');
    });
    req.pipe(proxyReq);
  });
};

createServer(async (req, res) => {
  const [rawPath, query] = req.url.split('?');
  const urlPath = decodeURIComponent(rawPath);
  const search = query ? `?${query}` : '';

  if (urlPath === '/api' || urlPath.startsWith('/api/')) return proxyApi(req, res);

  const blog = urlPath.match(BLOG_REDIRECT);
  if (blog) {
    const location = `/${blog[1] ?? ''}insights${blog[2]}${search}`;
    res.writeHead(301, { location });
    return res.end();
  }

  const share = urlPath.match(SHARE_REDIRECT);
  if (share) {
    res.writeHead(301, { location: share[1] ? '/en' : '/' });
    return res.end();
  }

  const slash = urlPath.match(TRAILING_SLASH);
  if (slash) {
    res.writeHead(301, { location: `/${slash[1]}${search}` });
    return res.end();
  }

  // nginx `try_files $uri /index.html` for the dynamic-route fallback.
  if (SPA_FALLBACK.test(urlPath)) {
    const hit = (await resolveFile(urlPath)) || (await resolveFile('/index.html'));
    if (hit) return send(res, 200, hit);
  }

  // nginx `location /`: try_files $uri $uri/index.html =404
  const hit = (await resolveFile(urlPath)) || (await resolveFile(join(urlPath, 'index.html')));
  if (hit) return send(res, 200, hit);

  // nginx `error_page 404 /index.html` — real 404 status, SPA shell body, so
  // React Router's catch-all renders the localized NotFound page.
  const shell = await resolveFile('/index.html');
  if (shell) return send(res, 404, shell);

  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('build/ not found — run `npm run build` first');
}).listen(PORT, () => {
  console.log(`E2E static server (nginx-equivalent) serving build/ on http://localhost:${PORT}`);
});
