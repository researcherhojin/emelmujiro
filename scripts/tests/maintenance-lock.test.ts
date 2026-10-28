import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { acquireLock } from '../maintenance/lock.ts';

test('maintenance lock excludes another process, does not expire, and releases only its owner', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'maintenance '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'lock');
  const release = acquireLock(file, 'test');
  fs.utimesSync(file, new Date(0), new Date(0));
  const child = spawnSync(process.execPath, [
    '--input-type=module',
    '-e',
    `import {acquireLock} from ${JSON.stringify(new URL('../maintenance/lock.ts', import.meta.url).href)}; acquireLock(${JSON.stringify(file)},'competitor');`,
  ]);
  assert.notEqual(child.status, 0);
  assert.throws(() => acquireLock(file, 'same process'));
  release();
  assert.equal(fs.existsSync(file), false);
  const second = acquireLock(file, 'second');
  fs.writeFileSync(file, 'replacement owner');
  assert.throws(second);
  assert.equal(fs.readFileSync(file, 'utf8'), 'replacement owner');
});

test('malformed and orphaned locks require inspection instead of unsafe automatic eviction', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'orphan lock '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'lock');
  for (const value of ['invalid', JSON.stringify({ pid: 2147483647, token: 'orphan' })]) {
    fs.writeFileSync(file, value);
    assert.throws(() => acquireLock(file, 'new'));
    assert.equal(fs.readFileSync(file, 'utf8'), value);
  }
});

test('maintenance wrapper releases on a clean child exit and checks inherited ownership', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wrapper '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.join(directory, 'scripts/maintenance'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'scripts/shared'));
  for (const name of ['maintenance.ts', 'maintenance/lock.ts', 'shared/paths.ts']) {
    fs.copyFileSync(new URL('../' + name, import.meta.url), path.join(directory, 'scripts', name));
  }
  fs.writeFileSync(
    path.join(directory, 'scripts/auto-deploy.sh'),
    `"${process.execPath}" "${directory}/scripts/maintenance.ts" check\n`
  );
  const result = spawnSync(
    process.execPath,
    [path.join(directory, 'scripts/maintenance.ts'), 'deploy'],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(directory, 'backend/logs/maintenance.lock')), false);
});

test('cron installation failure does not arm refresh; successful installation preserves existing jobs', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cron fixture '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const bin = path.join(directory, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, 'crontab'),
    `#!/bin/sh\nif [ "$1" = -l ]; then echo '0 3 * * * existing-job'; exit 0; fi\ncat > "$CRON_CAPTURE"\nexit "$CRON_EXIT"\n`,
    { mode: 0o700 }
  );
  for (const exit of ['1', '0']) {
    const result = spawnSync(
      'make',
      [
        '-f',
        new URL('../../Makefile', import.meta.url).pathname,
        'setup-image-refresh-cron',
        `CURDIR=${directory}`,
      ],
      {
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          CRON_CAPTURE: path.join(directory, 'captured'),
          CRON_EXIT: exit,
        },
        encoding: 'utf8',
      }
    );
    assert.equal(result.status === 0, exit === '0', result.stderr);
    assert.equal(
      fs.existsSync(path.join(directory, 'backend/logs/security/refresh-enabled')),
      exit === '0'
    );
  }
  const cron = fs.readFileSync(path.join(directory, 'captured'), 'utf8');
  assert.match(cron, /existing-job/);
  assert.match(cron, /30 0 \* \* \*/);
  assert.match(cron, /backend\/logs\/image-refresh.log/);
});
