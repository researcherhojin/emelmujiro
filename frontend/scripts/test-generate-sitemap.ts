import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, mock, test } from 'node:test';

process.env.SITE_URL = 'https://example.test';
process.env.API_URL = 'https://api.example.test/api';
// Loaded after the env above is set: generate-sitemap reads SITE_URL and API_URL
// when it is imported, and a static import would run first.
const { generateSitemap } = await import('./generate-sitemap.ts');
afterEach(() => mock.restoreAll());

const post = (slug: string, translated = false) => ({
  slug,
  is_published: true,
  is_translated: translated,
  updated_at: '2026-10-22T00:00:00Z',
});
function pages(...values: unknown[]) {
  let index = 0;
  return mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => values[index++],
  }));
}

test('valid empty inventory retains canonical static routes', async () => {
  pages({ count: 0, results: [] });
  const result = await generateSitemap();
  assert.equal(result.postCount, 0);
  assert.match(result.xml, /<loc>https:\/\/example.test\/en<\/loc>/);
  assert.doesNotMatch(result.xml, /https:\/\/example.test\/en\/["<]/);
});

test('translated articles get both URLs; untranslated articles get Korean only', async () => {
  pages({ count: 2, results: [post('한국어-글'), post('translated-article', true)] });
  const result = await generateSitemap();
  assert.equal(result.postCount, 2);
  assert.equal(result.translatedCount, 1);
  assert.match(result.xml, /<loc>https:\/\/example.test\/insights\/한국어-글<\/loc>/);
  assert.doesNotMatch(result.xml, /\/en\/insights\/한국어-글/);
  assert.match(result.xml, /<loc>https:\/\/example.test\/en\/insights\/translated-article<\/loc>/);
});

test('fetches subsequent pages from the configured API', async () => {
  const fetchMock = pages(
    { count: 2, results: [post('first')] },
    { count: 2, results: [post('second')] }
  );
  assert.equal((await generateSitemap()).postCount, 2);
  assert.match(String(fetchMock.mock.calls[1].arguments[0]), /page=2&page_size=100$/);
});

test('network failure rejects generation', async () => {
  mock.method(globalThis, 'fetch', async () => {
    throw new Error('Network unavailable');
  });
  await assert.rejects(generateSitemap(), /Network unavailable/);
});

test('HTTP failure on a later page rejects the whole inventory', async () => {
  let calls = 0;
  mock.method(globalThis, 'fetch', async () =>
    ++calls === 1
      ? { ok: true, json: async () => ({ count: 2, results: [post('first')] }) }
      : { ok: false, status: 503 }
  );
  await assert.rejects(generateSitemap(), /HTTP 503 on page 2/);
});

test('malformed JSON rejects generation', async () => {
  mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => {
      throw new SyntaxError('Invalid JSON');
    },
  }));
  await assert.rejects(generateSitemap(), /Invalid JSON/);
});

test('invalid inventory shapes reject generation', async () => {
  for (const data of [{ count: -1, results: [] }, { count: '0', results: [] }, { count: 0 }]) {
    pages(data);
    await assert.rejects(generateSitemap(), /Invalid article inventory/);
    mock.restoreAll();
  }
});

test('empty page before the declared total rejects generation', async () => {
  pages({ count: 1, results: [] });
  await assert.rejects(generateSitemap(), /empty with 0\/1 fetched/);
});

test('changing counts reject generation', async () => {
  pages({ count: 2, results: [post('first')] }, { count: 1, results: [post('second')] });
  await assert.rejects(generateSitemap(), /count changed/);
});

test('duplicate articles cannot mask a missing article across pages', async () => {
  pages({ count: 2, results: [post('same')] }, { count: 2, results: [post('same')] });
  await assert.rejects(generateSitemap(), /duplicate article slug/);
});

test('more results than declared rejects generation', async () => {
  pages({ count: 0, results: [post('extra')] });
  await assert.rejects(generateSitemap(), /Fetched 1 posts, API count 0/);
});

test('CLI exits unsuccessfully without overwriting existing sitemap on failure', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-regression-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.mkdirSync(path.join(root, 'public'));
    fs.copyFileSync(
      import.meta.dirname + '/generate-sitemap.ts',
      path.join(root, 'scripts/generate-sitemap.ts')
    );
    fs.writeFileSync(path.join(root, 'package.json'), '{}');
    // Without this, node reads the copied .ts as typeless and warns.
    fs.writeFileSync(path.join(root, 'scripts/package.json'), '{"type": "module"}');
    const output = path.join(root, 'public/sitemap.xml');
    fs.writeFileSync(output, 'existing sitemap');
    const preload = path.join(root, 'offline.cjs');
    fs.writeFileSync(preload, 'globalThis.fetch = async () => { throw new Error("Offline"); };');
    const result = spawnSync(process.execPath, [
      '--require',
      preload,
      path.join(root, 'scripts/generate-sitemap.ts'),
    ]);
    assert.equal(result.status, 1);
    assert.equal(fs.readFileSync(output, 'utf8'), 'existing sitemap');
    assert.equal(fs.existsSync(path.join(root, 'public/robots.txt')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
