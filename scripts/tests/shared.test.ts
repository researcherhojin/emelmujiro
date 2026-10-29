import type { TestContext } from 'node:test';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { enterMaintenance } from '../shared/maintenance-entry.ts';
import { SCRIPTS_ROOT } from '../shared/paths.ts';
import { withPidLock } from '../shared/pid-lock.ts';
import { ensurePrivateDir, writePrivate, writePrivateAtomic } from '../shared/private-fs.ts';

const messages = { invalid: 'invalid lock', busy: 'already running' };

function temporaryDirectory(t: TestContext): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shared fixture '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function deadPid(): number {
  const child = spawnSync(process.execPath, ['-e', '0']);
  assert.equal(child.status, 0);
  return child.pid;
}

test('withPidLock writes its own PID, runs, and always releases', (t) => {
  const lock = path.join(temporaryDirectory(t), 'scan.lock');
  const seen = withPidLock(lock, messages, () => fs.readFileSync(lock, 'utf8'));
  assert.equal(seen, String(process.pid));
  assert.equal(fs.existsSync(lock), false);
  assert.throws(
    () =>
      withPidLock(lock, messages, () => {
        throw new Error('scan failed');
      }),
    /scan failed/
  );
  assert.equal(fs.existsSync(lock), false);
});

test('withPidLock takes over a lock whose owner is gone', (t) => {
  const lock = path.join(temporaryDirectory(t), 'scan.lock');
  fs.writeFileSync(lock, String(deadPid()));
  assert.equal(
    withPidLock(lock, messages, () => fs.readFileSync(lock, 'utf8')),
    String(process.pid)
  );
});

test('withPidLock refuses a live owner and an invalid lock, leaving both in place', (t) => {
  const directory = temporaryDirectory(t);
  const live = path.join(directory, 'live.lock');
  fs.writeFileSync(live, String(process.pid));
  assert.throws(() => withPidLock(live, messages, () => 0), /already running/);
  assert.equal(fs.readFileSync(live, 'utf8'), String(process.pid));
  const invalid = path.join(directory, 'invalid.lock');
  fs.writeFileSync(invalid, 'not a pid');
  assert.throws(() => withPidLock(invalid, messages, () => 0), /invalid lock/);
  assert.equal(fs.readFileSync(invalid, 'utf8'), 'not a pid');
});

test('private files and directories are owner-only, and the atomic write renames', (t) => {
  const directory = path.join(temporaryDirectory(t), 'nested', 'reports');
  ensurePrivateDir(directory);
  assert.equal(fs.statSync(directory).mode & 0o777, 0o700);
  const file = path.join(directory, 'error.log');
  writePrivate(file, 'detail');
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  const target = path.join(directory, 'summary.json');
  const temporary = path.join(directory, 'summary-1.tmp');
  writePrivateAtomic(target, temporary, '{}\n');
  assert.equal(fs.readFileSync(target, 'utf8'), '{}\n');
  assert.equal(fs.statSync(target).mode & 0o777, 0o600);
  assert.equal(fs.existsSync(temporary), false);
});

class Exit extends Error {
  readonly code: number;
  constructor(code: number) {
    super(`exit ${code}`);
    this.code = code;
  }
}
const exit = (code: number): never => {
  throw new Exit(code);
};

test('enterMaintenance re-executes under maintenance.ts without a token', () => {
  const calls: string[][] = [];
  const spawn = (_binary: string, args: string[]) => {
    calls.push(args);
    return { status: 3 };
  };
  assert.throws(() => enterMaintenance('refresh', { env: {}, spawn, exit }), { code: 3 });
  assert.equal(calls.length, 1);
  const entry = calls[0]![0]!;
  assert.equal(entry, path.join(SCRIPTS_ROOT, 'maintenance/maintenance.ts'));
  assert.ok(fs.existsSync(entry));
  assert.equal(calls[0]![1], 'refresh');
  assert.throws(
    () => enterMaintenance('security', { env: {}, spawn: () => ({ status: null }), exit }),
    { code: 1 }
  );
});

test('enterMaintenance with a token requires the ownership check to pass', () => {
  const env = { MAINTENANCE_TOKEN: 'token' };
  const calls: string[][] = [];
  const passing = (_binary: string, args: string[]) => {
    calls.push(args);
    return { status: 0 };
  };
  enterMaintenance('security', { env, spawn: passing, exit });
  assert.deepEqual(
    calls.map((args) => args[1]),
    ['check']
  );
  assert.throws(() => enterMaintenance('security', { env, spawn: () => ({ status: 1 }), exit }), {
    code: 1,
  });
});
