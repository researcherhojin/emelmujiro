// cspell:ignore pageviews nextjs mmdb
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const base = 'http://127.0.0.1:3000';
async function request(path, body, token) {
  const response = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  assert.equal(response.status, 200, `${path}: ${text}`);
  return text;
}
assert.equal(process.getuid(), 1001);
assert.equal(require('./package.json').version, '3.4.0');
assert.equal(require('next/package.json').version, '16.3.8');
assert.ok(existsSync('node_modules/.bin/prisma'));
assert.ok(!existsSync('/usr/local/lib/node_modules/pnpm'));
assert.ok(!existsSync('/usr/local/lib/node_modules/npm'));
assert.ok(readFileSync('geo/GeoLite2-City.mmdb').length > 0);
assert.match(await request('/login'), /<html/);
assert.match(await request('/script.js'), /umami/);
assert.ok(JSON.parse(await request('/openapi.json')).paths);
const { token } = JSON.parse(await request('/api/auth/login', { username: 'admin', password: 'umami' }));
assert.ok(token);
const website = JSON.parse(await request('/api/websites', { name: 'Security verification', domain: 'security.test' }, token));
assert.ok(website.id);
const startAt = Date.now() - 60_000;
const event = JSON.parse(await request('/api/send', {
  type: 'event', payload: {
    website: website.id, hostname: 'security.test', url: '/security-check',
    title: 'Security verification', language: 'en-US', screen: '1280x720',
    ip: '8.8.8.8', userAgent: 'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36',
  },
}));
assert.ok(event.cache);
assert.ok(event.sessionId);
const stats = JSON.parse(await request(`/api/websites/${website.id}/stats?startAt=${startAt}&endAt=${Date.now() + 1000}`, undefined, token));
assert.equal(Number(stats.pageviews), 1);
console.log('PASS: patched Next, local Prisma, geo database, login page, tracker script, OpenAPI, login, website creation, ingestion and analytics');
