import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { AddressInfo } from 'node:net';
import { runOperations, validateOperations, readOperations } from '../security/operations.ts';
import { createWebhookServer } from '../deploy/server.ts';

const clean = () => ({
  version: 1,
  completedAt: new Date().toISOString(),
  dependencies: true,
  images: true,
  backup: true,
  offsite: true,
});

test('summary rejects stale, missing and false-success fields and strips details', () => {
  for (const input of [
    {},
    { ...clean(), backup: 'true' },
    { ...clean(), completedAt: 'invalid' },
    { ...clean(), completedAt: new Date(Date.now() - 37 * 3600000).toISOString() },
  ]) {
    assert.throws(() => validateOperations(input));
  }
  const original = clean();
  assert.deepEqual(
    validateOperations({ ...original, secret: 'private', imageId: 'private' }),
    original
  );
});

test('all operations run after failure and atomically publish failure', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'operations '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  let calls = 0;
  const report = runOperations('/repo with spaces', directory, (_binary, args) => {
    calls++;
    assert.ok(args[0].startsWith('/repo with spaces/'));
    if (calls === 1) throw new Error('private error');
    return calls === 3;
  });
  assert.equal(calls, 3);
  assert.equal(report.backup, false);
  assert.equal(report.dependencies, false);
  assert.equal(report.images, true);
  assert.deepEqual(readOperations(path.join(directory, 'operations.json')), {
    ...report,
    refresh: true,
  });
});

test('report endpoint requires authentication and cannot leak diagnostics', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'report '));
  const file = path.join(directory, 'operations.json');
  const { server, shutdown } = createWebhookServer({
    secret: 'test-secret',
    script: '/nonexistent',
    lockFile: path.join(directory, 'deploy.lock'),
    operationsFile: file,
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    shutdown();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/security-report`;
  assert.equal((await fetch(url)).status, 401);
  const options = { headers: { 'X-Deploy-Secret': 'test-secret' } };
  assert.equal((await fetch(url, options)).status, 503);
  const report = clean();
  fs.writeFileSync(
    path.join(directory, 'offsite.json'),
    JSON.stringify({
      version: 1,
      completedAt: report.completedAt,
      backedUpAt: report.completedAt,
      backup: '20261023T055507Z-3808c170.cms',
    })
  );
  fs.writeFileSync(file, JSON.stringify({ ...report, diagnostics: 'sensitive' }));
  const response = await fetch(url, options);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ...report, refresh: true });
  fs.writeFileSync(file, 'x'.repeat(4097));
  assert.equal((await fetch(url, options)).status, 503);
});

test('independent copy needs both recent receipt and recent original snapshot', async (t) => {
  const { offsiteFresh } = await import('../security/operations.ts');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'receipt '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  assert.equal(offsiteFresh(directory), false);
  const now = new Date().toISOString();
  const receipt = {
    version: 1,
    completedAt: now,
    backedUpAt: now,
    backup: '20261023T055507Z-3808c170.cms',
  };
  const file = path.join(directory, 'offsite.json');
  fs.writeFileSync(file, JSON.stringify(receipt));
  assert.equal(offsiteFresh(directory), true);
  for (const key of ['completedAt', 'backedUpAt']) {
    fs.writeFileSync(
      file,
      JSON.stringify({ ...receipt, [key]: new Date(Date.now() - 37 * 3600000).toISOString() })
    );
    assert.equal(offsiteFresh(directory), false);
  }
});
