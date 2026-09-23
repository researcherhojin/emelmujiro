#!/usr/bin/env node
/**
 * Cross-reference the four independent route lists and the SPA-fallback regex.
 *
 * App.tsx declares the routes that exist. Three other files each hardcode
 * their own copy of that list and none of them consults any other:
 *
 *   1. frontend/src/App.tsx                  — pageRoutes + standaloneRoutes
 *   2. frontend/scripts/generate-sitemap.js  — staticRoutes (sitemap + prerender)
 *   3. frontend/e2e/seo.spec.ts              — routes (SEO assertions)
 *   4. frontend/lighthouserc.js              — ci.collect.url
 *
 * The expensive failure is #1 without #2: no build/<path>/index.html is
 * emitted, the path does not match nginx's SPA-fallback regex, so
 * `try_files … =404` fires on a real page and it is absent from sitemap.xml.
 * The prerender step still prints success because it asserts the count of
 * routes it was handed, so it cannot detect one it was never given.
 *
 * The fifth and sixth copies of route knowledge are the SPA-fallback regex
 * `^/(en/)?(insights/.+|login)$`, written once in frontend/nginx.conf and
 * mirrored in frontend/scripts/e2e-server.mjs. This script does NOT attempt
 * regex equivalence against App.tsx's parameterized patterns. It checks the
 * two files carry the byte-identical pattern, then runs that pattern against
 * one concrete URL per route: every route without a prerendered document
 * must match (or nginx hard-404s it), and no prerendered route may match
 * (regex locations beat `location /`, so a match would serve the shell
 * instead of the prerendered document). nginx itself is never executed here —
 * the claim is "the mirror carries the same pattern and the pattern admits
 * the right routes", not "nginx is tested".
 *
 * Run: npm run check:routes (from frontend/) — node builtins only, no build,
 * no node_modules, so CI can run it before `npm ci`.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND = path.resolve(__dirname, '..');

// Routes that exist in App.tsx and are deliberately NOT prerendered. Each is
// served by nginx's SPA-fallback regex instead, so it has no build/<path>/
// document and must not be in staticRoutes. Kept explicit rather than
// pattern-matched: "is this page for crawlers" is a judgment, not a shape.
// Entries are verified to still exist in App.tsx, so deleting a route here
// fails rather than silently rotting.
const NOT_PRERENDERED = {
  'insights/new': 'admin-only blog editor, behind auth',
  login: 'standalone auth page, no crawler value',
};

function read(rel) {
  return fs.readFileSync(path.join(FRONTEND, rel), 'utf8');
}

/** Pull an array literal's body out of `const <name> = [ … ];`. */
function arrayBody(source, name, file) {
  const start = source.indexOf(`const ${name} = [`);
  if (start === -1) {
    throw new Error(`could not find "const ${name} = [" in ${file}`);
  }
  const from = source.indexOf('[', start);
  let depth = 0;
  for (let i = from; i < source.length; i += 1) {
    if (source[i] === '[') depth += 1;
    else if (source[i] === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(from + 1, i);
    }
  }
  throw new Error(`unterminated array "${name}" in ${file}`);
}

/** Normalize 'contact' | '/contact' | '' -> '/contact' | '/'. */
function normalize(p) {
  if (p === '' || p === '/') return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

function appRoutes() {
  const src = read('src/App.tsx');
  const routes = [];
  for (const name of ['pageRoutes', 'standaloneRoutes']) {
    const body = arrayBody(src, name, 'src/App.tsx');
    if (/index:\s*true/.test(body)) routes.push('/');
    for (const m of body.matchAll(/path:\s*'([^']*)'/g)) {
      routes.push(normalize(m[1]));
    }
  }
  return routes;
}

function seoSpecRoutes() {
  const src = read('e2e/seo.spec.ts');
  const body = arrayBody(src, 'routes', 'e2e/seo.spec.ts');
  return [...body.matchAll(/'([^']*)'/g)].map((m) => normalize(m[1]));
}

/**
 * The SPA-fallback regex from nginx.conf (the `location ~` whose block falls
 * back to /app.html) and its e2e-server.mjs mirror (`const SPA_FALLBACK`),
 * both as plain pattern source with no JS `\/` escaping.
 */
function fallbackPatterns() {
  const nginx = read('nginx.conf');
  const blocks = [...nginx.matchAll(/^\s*location ~ (\S+) \{\n([\s\S]*?)^\s*\}/gm)];
  const fallback = blocks.filter(([, , body]) => /try_files \$uri \/app\.html;/.test(body));
  if (fallback.length !== 1) {
    throw new Error(
      `nginx.conf: expected exactly one \`location ~\` block with \`try_files $uri /app.html\`, ` +
        `found ${fallback.length}`
    );
  }
  const mirrorSrc = read('scripts/e2e-server.mjs');
  const m = mirrorSrc.match(/^const SPA_FALLBACK = \/(.+)\/;$/m);
  if (!m) throw new Error('e2e-server.mjs: could not find `const SPA_FALLBACK = /…/;`');
  return { nginx: fallback[0][1], mirror: m[1].replace(/\\\//g, '/') };
}

function lighthouseRoutes() {
  const config = require(path.join(FRONTEND, 'lighthouserc.js'));
  const urls = config?.ci?.collect?.url;
  if (!Array.isArray(urls)) throw new Error('lighthouserc.js: ci.collect.url is not an array');
  return urls.map((u) => normalize(new URL(u).pathname.replace(/\/$/, '')));
}

function main() {
  const { staticRoutes } = require(path.join(FRONTEND, 'scripts/generate-sitemap.js'));
  const prerendered = staticRoutes.map((r) => normalize(r.url));
  const app = appRoutes();
  const seo = seoSpecRoutes();
  const lighthouse = lighthouseRoutes();

  const errors = [];

  // 1. Every prerenderable App.tsx route is in staticRoutes.
  //    Dynamic (':') and catch-all ('*') routes can never be prerendered.
  const prerenderable = app.filter((r) => !r.includes(':') && !r.includes('*'));
  for (const route of prerenderable) {
    const key = route === '/' ? '/' : route.slice(1);
    if (key in NOT_PRERENDERED) continue;
    if (!prerendered.includes(route)) {
      errors.push(
        `App.tsx declares ${route} but staticRoutes does not — it will ship a hard 404 ` +
          `(no build${route}/index.html, no sitemap entry). Add it to staticRoutes in ` +
          `scripts/generate-sitemap.js, or to NOT_PRERENDERED in this script if it is ` +
          `deliberately SPA-only.`
      );
    }
  }

  // 2. Every staticRoutes entry still exists in App.tsx.
  for (const route of prerendered) {
    if (!app.includes(route)) {
      errors.push(
        `staticRoutes prerenders ${route} but App.tsx has no such route — ` +
          `the prerendered document renders the catch-all NotFound page.`
      );
    }
  }

  // 3. NOT_PRERENDERED entries are real. Keeps this script's own exception
  //    list from outliving the routes it excuses.
  for (const key of Object.keys(NOT_PRERENDERED)) {
    if (!app.includes(normalize(key))) {
      errors.push(
        `NOT_PRERENDERED lists ${normalize(key)} but App.tsx no longer declares it — ` +
          `drop the entry from ${path.relative(FRONTEND, __filename)}.`
      );
    }
  }

  // 4. seo.spec.ts covers exactly the prerendered set. This is the list that
  //    asserts title/description/canonical on the documents crawlers receive,
  //    so a prerendered route missing here is an unchecked document.
  for (const route of prerendered) {
    if (!seo.includes(route)) {
      errors.push(`e2e/seo.spec.ts does not cover prerendered route ${route}.`);
    }
  }
  for (const route of seo) {
    if (!prerendered.includes(route)) {
      errors.push(`e2e/seo.spec.ts checks ${route}, which is not prerendered.`);
    }
  }

  // 5. Lighthouse audits a subset of the prerendered set. Not equality —
  //    numberOfRuns is 3, so each added URL costs three full runs, and which
  //    routes are worth that is a budget call. A URL that is NOT a prerendered
  //    route is always wrong, though: it is auditing a page that does not exist
  //    as a document.
  for (const route of lighthouse) {
    if (!prerendered.includes(route)) {
      errors.push(`lighthouserc.js audits ${route}, which is not a prerendered route.`);
    }
  }
  const unaudited = prerendered.filter((r) => !lighthouse.includes(r));

  // 6. The SPA-fallback regex: nginx.conf and its e2e-server.mjs mirror carry
  //    the same pattern, and that pattern admits exactly the routes that have
  //    no prerendered document. One concrete URL per route, ko and en; ':id'
  //    style params become a literal segment, the '*' catch-all is skipped.
  const fallback = fallbackPatterns();
  if (fallback.nginx !== fallback.mirror) {
    errors.push(
      `SPA-fallback regex differs: nginx.conf has ${fallback.nginx}, ` +
        `e2e-server.mjs SPA_FALLBACK has ${fallback.mirror}. Keep the two identical — ` +
        `the E2E suite only proves what the mirror does.`
    );
  }
  const fallbackRe = new RegExp(fallback.nginx);
  const concrete = (route) => route.replace(/:[A-Za-z_]+/g, 'sample');
  const urlsFor = (route) =>
    ['', '/en'].map((p) => `${p}${route === '/' ? '' : concrete(route)}` || '/');
  const spaOnly = app.filter(
    (r) => !r.includes('*') && (r.includes(':') || (r !== '/' && r.slice(1) in NOT_PRERENDERED))
  );
  for (const route of spaOnly) {
    for (const url of urlsFor(route)) {
      if (!fallbackRe.test(url)) {
        errors.push(
          `App.tsx route ${route} has no prerendered document and ${url} does not match the ` +
            `SPA-fallback regex ${fallback.nginx} — nginx \`try_files … =404\` hard-404s it. ` +
            `Extend the regex in BOTH frontend/nginx.conf and frontend/scripts/e2e-server.mjs.`
        );
      }
    }
  }
  for (const route of prerendered) {
    for (const url of urlsFor(route)) {
      if (fallbackRe.test(url)) {
        errors.push(
          `SPA-fallback regex ${fallback.nginx} matches prerendered route ${url} — nginx regex ` +
            `locations beat \`location /\`, so the shell would be served instead of ` +
            `build${route === '/' ? '' : route}/index.html.`
        );
      }
    }
  }

  console.log(`App.tsx routes        (${app.length}): ${app.join(' ')}`);
  console.log(`staticRoutes          (${prerendered.length}): ${prerendered.join(' ')}`);
  console.log(`e2e/seo.spec.ts       (${seo.length}): ${seo.join(' ')}`);
  console.log(`lighthouserc.js       (${lighthouse.length}): ${lighthouse.join(' ')}`);
  console.log(
    `SPA-fallback regex    : ${fallback.nginx} (nginx.conf${
      fallback.nginx === fallback.mirror ? ' == e2e-server.mjs' : ' != e2e-server.mjs'
    }); SPA-only routes: ${spaOnly.join(' ')}`
  );
  if (unaudited.length) {
    console.log(`\nnote: prerendered but not audited by Lighthouse: ${unaudited.join(' ')}`);
  }

  if (errors.length) {
    console.error(`\n${errors.length} route-list mismatch(es):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('\nAll four route lists and the SPA-fallback regex agree.');
}

main();
