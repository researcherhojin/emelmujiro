#!/usr/bin/env node
/**
 * Cross-reference the four independent route lists.
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
 * Run: npm run check:routes (from frontend/)
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

  console.log(`App.tsx routes        (${app.length}): ${app.join(' ')}`);
  console.log(`staticRoutes          (${prerendered.length}): ${prerendered.join(' ')}`);
  console.log(`e2e/seo.spec.ts       (${seo.length}): ${seo.join(' ')}`);
  console.log(`lighthouserc.js       (${lighthouse.length}): ${lighthouse.join(' ')}`);
  if (unaudited.length) {
    console.log(`\nnote: prerendered but not audited by Lighthouse: ${unaudited.join(' ')}`);
  }

  if (errors.length) {
    console.error(`\n${errors.length} route-list mismatch(es):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('\nAll four route lists agree.');
}

main();
