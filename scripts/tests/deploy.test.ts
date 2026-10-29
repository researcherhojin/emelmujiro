import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { createWebhookServer } from '../deploy/server.ts';
import { spawn, spawnSync } from 'node:child_process';
import { SCRIPTS_ROOT } from '../shared/paths.ts';

test('deployment contract: authentication, SHA, body limit, env forwarding and busy lock', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy fixture '));
  const marker = path.join(directory, 'sha.txt');
  const script = path.join(directory, 'fake deploy.sh');
  // Write then rename: a bare `>` creates the marker empty before printf
  // fills it, and the poll below can read it in that window (CI, 2026-10-24).
  fs.writeFileSync(
    script,
    `printf '%s' "$DEPLOY_SHA" > '${marker}.tmp' && mv '${marker}.tmp' '${marker}'\nsleep 1\n`
  );
  const lockFile = path.join(directory, 'deploy.lock');
  const { server, shutdown } = createWebhookServer({ secret: 'fixture-secret', script, lockFile });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    shutdown();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const request = (body: string, authenticated = true) =>
    fetch(`${base}/deploy`, {
      method: 'POST',
      body,
      headers: authenticated ? { 'X-Deploy-Secret': 'fixture-secret' } : {},
    });
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), {
    status: 'ok',
    deploying: false,
  });
  assert.equal((await fetch(`${base}/unknown`)).status, 404);
  assert.equal((await request('x'.repeat(5000), false)).status, 401);
  assert.equal(fs.existsSync(marker), false);
  for (const sha of [
    'short',
    'a'.repeat(39),
    'A'.repeat(40),
    'a'.repeat(40) + '; touch unwanted',
  ]) {
    assert.equal((await request(JSON.stringify({ sha }))).status, 400);
  }
  assert.equal((await request('x'.repeat(4097))).status, 413);
  assert.equal((await request('한'.repeat(1400))).status, 413);
  const sha = 'a'.repeat(40);
  const accepted = await request(JSON.stringify({ sha: ` ${sha} ` }));
  assert.equal(accepted.status, 200);
  assert.deepEqual(await accepted.json(), { status: 'deploy started', sha });
  for (let attempt = 0; attempt < 50 && !fs.existsSync(marker); attempt++) await delay(10);
  assert.equal(fs.readFileSync(marker, 'utf8'), sha);
  assert.equal((await request(JSON.stringify({ sha }))).status, 409);
  assert.equal((await (await fetch(`${base}/health`)).json()).deploying, true);
  for (let attempt = 0; attempt < 100 && fs.existsSync(lockFile); attempt++) await delay(20);
  assert.equal(fs.existsSync(lockFile), false);
  // Preserve the existing legacy-caller fallback to origin/main.
  const legacy = await request('not-json');
  assert.deepEqual(await legacy.json(), { status: 'deploy started', sha: null });
});

test('webhook refuses an absent authentication secret', () => {
  assert.throws(() => createWebhookServer({ secret: '', script: '/unused', lockFile: '/unused' }));
});

test('webhook entry works from another cwd and a checkout path containing spaces', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'entry fixture '));
  const scripts = path.join(directory, 'scripts');
  fs.cpSync(SCRIPTS_ROOT, scripts, {
    recursive: true,
    filter: (source) => fs.statSync(source).isDirectory() || /\.(ts|js|json)$/.test(source),
  });
  const entry = path.join(scripts, 'deploy/deploy-webhook.ts');
  const missing = spawnSync(process.execPath, [entry], {
    cwd: os.tmpdir(),
    env: { ...process.env, DEPLOY_SECRET: '' },
    encoding: 'utf8',
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /DEPLOY_SECRET/);
  const child = spawn(process.execPath, [entry], {
    cwd: os.tmpdir(),
    env: { ...process.env, DEPLOY_SECRET: 'fixture', DEPLOY_PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => {
    // Do not invoke the entry's global production lock cleanup in a test.
    child.kill('SIGKILL');
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const port = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Entry did not start')), 5000);
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.stdout.on('data', (data) => {
      const match = String(data).match(/listening on 127\.0\.0\.1:(\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  const response = await fetch(`http://127.0.0.1:${port}/deploy`, {
    method: 'POST',
    headers: { 'X-Deploy-Secret': 'fixture' },
    body: '{"sha":"invalid"}',
  });
  assert.equal(response.status, 400);
  assert.equal(fs.existsSync(path.join(scripts, 'deploy/auto-deploy.sh')), false);
});
