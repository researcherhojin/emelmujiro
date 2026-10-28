import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { refreshImages, REFRESH_SERVICES } from '../maintenance/refresh.ts';
import { refreshFresh } from '../security/operations.ts';
import type { Command } from '../shared/runtime.ts';

const sha = 'a'.repeat(40);
const old = `sha256:${'1'.repeat(64)}`,
  candidate = `sha256:${'2'.repeat(64)}`;
const inventory = {
  SchemaVersion: 2,
  Results: [
    {
      Class: 'os-pkgs',
      Type: 'alpine',
      Target: 'Alpine',
      Packages: [{ Name: 'musl', Version: '1' }],
      Vulnerabilities: [],
    },
  ],
};

function fixture(
  t: TestContext,
  fail?: (binary: string, args: string[], state: { applied: number }) => boolean
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'refresh test '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = path.join(root, 'security/refresh');
  const images: Record<string, string> = Object.fromEntries(REFRESH_SERVICES.map((s) => [s, old]));
  const tags: Record<string, string> = Object.fromEntries(
    REFRESH_SERVICES.map((s) => [`image/${s}`, old])
  );
  const calls: [string, string[]][] = [];
  const state = { applied: 0 };
  const run: Command = (binary, args) => {
    calls.push([binary, args]);
    if (fail?.(binary, args, state)) throw new Error('injected failure');
    if (binary === 'git' && args.includes('status')) return '';
    if (binary === 'git' && args.includes('rev-parse')) return sha;
    if (binary === 'git' && args.includes('archive'))
      fs.writeFileSync(args[args.indexOf('--output') + 1], 'archive');
    if (binary === 'docker' && args[0] === 'container') {
      const service = args.at(-1)!.replace('emelmujiro-', '');
      return JSON.stringify([images[service], `image/${service}`, true]);
    }
    if (binary === 'docker' && args[0] === 'image') return candidate;
    if (binary === 'docker' && args[0] === 'tag') tags[args[2]] = args[1];
    if (binary === 'docker' && args[0] === 'compose') {
      const service = args.at(-1)!;
      images[service] = tags[`image/${service}`];
      state.applied++;
    }
    if (binary === 'curl' && args.at(-1)?.endsWith('/api/health/'))
      return JSON.stringify({ status: 'healthy', commit: sha });
    if (binary === 'curl' && args.includes('%{http_code}')) return '405';
    if (binary === 'trivy' && args.includes('--format')) return JSON.stringify(inventory);
    if (args[0]?.endsWith('scan-running-images.ts')) {
      fs.writeFileSync(
        path.join(directory, '../summary.json'),
        JSON.stringify({
          version: 1,
          completedAt: new Date().toISOString(),
          services: [...REFRESH_SERVICES, 'frontend'].map((name) => ({
            name,
            status: 'clean',
            findings: 0,
            imageId: candidate,
          })),
        })
      );
    }
    return '';
  };
  return { root, directory, run, calls, state, images };
}

test('refresh verifies candidates and backup before replacement, preserves SHA and publishes identities', (t) => {
  const f = fixture(t);
  const result = refreshImages({ ...f, trivy: 'trivy' });
  assert.equal(result.success, true);
  assert.equal(result.source, sha);
  assert.equal(f.state.applied, 3);
  assert.deepEqual(result.running, result.candidates);
  const firstApply = f.calls.findIndex(([bin, args]) => bin === 'docker' && args[0] === 'compose');
  assert.ok(
    f.calls.findIndex(([bin, args]) => bin === 'python3' && args[0].endsWith('backup-verify.py')) <
      firstApply
  );
  assert.equal(
    f.calls.filter(([bin, args]) => bin === 'trivy' && args.includes('--format')).length,
    3
  );
  assert.equal(
    f.calls.filter(
      ([bin, args]) =>
        bin === 'docker' &&
        args[0] === 'build' &&
        args.includes('--pull') &&
        args.includes('--no-cache') &&
        args.includes(`GIT_COMMIT=${sha}`)
    ).length,
    3
  );
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(f.directory, 'latest.json'), 'utf8')).success,
    true
  );
});

for (const phase of ['build', 'postgres', 'umami', 'backend', 'scan', 'backup', 'source']) {
  test(`failure before apply (${phase}) leaves running images untouched`, (t) => {
    let sourceReads = 0;
    const f = fixture(t, (bin, args) => {
      if (phase === 'source' && bin === 'git' && args.includes('rev-parse'))
        return ++sourceReads === 2;
      return phase === 'build'
        ? bin === 'docker' && args[0] === 'build'
        : phase === 'postgres'
          ? bin === 'bash' && args[0].endsWith('postgres/verify.sh')
          : phase === 'umami'
            ? bin === 'env'
            : phase === 'backend'
              ? bin === 'bash' && args[0].endsWith('verify-backend-image.sh')
              : phase === 'scan'
                ? bin === 'trivy' && args.includes('--format')
                : phase === 'backup'
                  ? bin === 'python3'
                  : false;
    });
    const result = refreshImages({ ...f, trivy: 'trivy' });
    assert.equal(result.success, false);
    assert.equal(result.recovery, 'not-needed');
    assert.equal(f.state.applied, 0);
    assert.ok(!f.calls.some(([bin, args]) => bin === 'docker' && args.includes('reload')));
  });
}

for (const failAt of [0, 1, 2]) {
  test(`partial replacement failure ${failAt} restores previous images`, (t) => {
    let failed = false;
    const f = fixture(t, (bin, args, state) => {
      if (!failed && bin === 'docker' && args[0] === 'compose' && state.applied === failAt) {
        failed = true;
        return true;
      }
      return false;
    });
    const result = refreshImages({ ...f, trivy: 'trivy' });
    assert.equal(result.success, false);
    assert.equal(result.recovery, 'passed');
    assert.deepEqual(result.running, result.old);
  });
}

test('failed rollback remains failure and cannot appear as a fresh success', (t) => {
  const f = fixture(t, (bin, args) => bin === 'docker' && args[0] === 'compose');
  const result = refreshImages({ ...f, trivy: 'trivy' });
  assert.equal(result.success, false);
  assert.equal(result.recovery, 'failed');
});

test('watchdog fails closed on missing, stale, failed or incomplete refresh and pending attempts', (t) => {
  const f = fixture(t);
  const parent = path.dirname(f.directory);
  fs.mkdirSync(parent, { recursive: true });
  assert.equal(refreshFresh(parent), true);
  fs.writeFileSync(path.join(parent, 'refresh-enabled'), '');
  assert.equal(refreshFresh(parent), false);
  const result = refreshImages({ ...f, trivy: 'trivy' });
  const latest = path.join(f.directory, 'latest.json'),
    attempt = path.join(f.directory, 'attempt.json');
  fs.writeFileSync(attempt, JSON.stringify({ startedAt: result.startedAt }));
  assert.equal(refreshFresh(parent), true);
  for (const change of [
    { success: false },
    { running: {} },
    { completedAt: 'invalid' },
    { source: 'unknown' },
    { completedAt: new Date(Date.now() - 37 * 3600000).toISOString() },
  ]) {
    fs.writeFileSync(latest, JSON.stringify({ ...result, ...change }));
    assert.equal(refreshFresh(parent), false);
  }
  fs.writeFileSync(latest, JSON.stringify(result));
  fs.writeFileSync(
    attempt,
    JSON.stringify({ startedAt: new Date(Date.now() + 1000).toISOString() })
  );
  assert.equal(refreshFresh(parent), false);
});

test('retention uses immutable generation times across repeated cleanup, never directory mtime', (t) => {
  const f = fixture(t);
  fs.mkdirSync(f.directory, { recursive: true });
  const names = Array.from(
    { length: 4 },
    (_, i) => `${String(i + 1).repeat(8)}-aaaa-aaaa-aaaa-${String(i + 1).repeat(12)}`
  );
  names.forEach((name, i) => {
    const dir = path.join(f.directory, name);
    fs.mkdirSync(dir);
    fs.writeFileSync(
      path.join(dir, 'result.json'),
      JSON.stringify({ startedAt: new Date(1000 + i * 1000).toISOString() })
    );
    fs.writeFileSync(path.join(dir, 'backend-scan.json'), 'old inventory');
    fs.utimesSync(dir, new Date(9999999999999 - i), new Date(9999999999999 - i));
  });
  const first = refreshImages({ ...f, trivy: 'trivy' });
  assert.equal(first.success, true);
  const firstId = fs
    .readdirSync(f.directory)
    .find((name) => !names.includes(name) && /^[a-f0-9-]{36}$/.test(name))!;
  let removed = f.calls
    .filter(([bin, args]) => bin === 'docker' && args[0] === 'image' && args[1] === 'rm')
    .map(([, args]) => args.at(-1)!);
  assert.ok(removed.some((tag) => tag.endsWith(names[0])));
  assert.ok(!removed.some((tag) => tag.endsWith(names[3])));
  f.calls.length = 0;
  const second = refreshImages({ ...f, trivy: 'trivy' });
  assert.equal(second.success, true);
  removed = f.calls
    .filter(([bin, args]) => bin === 'docker' && args[0] === 'image' && args[1] === 'rm')
    .map(([, args]) => args.at(-1)!);
  assert.ok(removed.some((tag) => tag.endsWith(names[3])));
  assert.ok(!removed.some((tag) => tag.endsWith(firstId)));
  assert.ok(!f.calls.some(([, args]) => args.includes('prune') || args.includes('--force')));
});

test('Compose can replace a container and then fail; rollback still restores it', (t) => {
  const f = fixture(t);
  const original = f.run;
  let failed = false;
  f.run = (binary, args) => {
    const output = original(binary, args);
    if (!failed && binary === 'docker' && args[0] === 'compose') {
      failed = true;
      throw new Error('recreated then timed out');
    }
    return output;
  };
  const result = refreshImages({ ...f, trivy: 'trivy' });
  assert.equal(result.success, false);
  assert.equal(result.recovery, 'passed');
  assert.deepEqual(result.running, result.old);
});

test('post-apply audit failure rolls back all three services', (t) => {
  const f = fixture(t, (_bin, args) => args[0]?.endsWith('scan-running-images.ts') === true);
  const result = refreshImages({ ...f, trivy: 'trivy' });
  assert.equal(result.success, false);
  assert.equal(result.recovery, 'passed');
  assert.equal(f.state.applied, 6);
  assert.deepEqual(result.running, result.old);
});
