import type { TestContext } from 'node:test';
import type { SecurityReport } from './security-report.ts';
import type { Command } from './security-runtime.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { scan } from './scan-running-images.ts';
import { SERVICES, validateReport, assertCleanSummary, readSummary } from './security-report.ts';
import { reconcile, TITLE, MARKER } from './security-monitor-issue.ts';
import { validateScan } from './validate-security-scan.ts';

const imageId = `sha256:${'a'.repeat(64)}`;
function report(): SecurityReport {
  return {
    version: 1,
    completedAt: new Date().toISOString(),
    services: SERVICES.map((name) => ({ name, imageId, status: 'clean', findings: 0 })),
  };
}
function temporary(t: TestContext) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'security-monitor-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('summary is bounded and excludes private diagnostics and image identity', () => {
  const input = report();
  Object.assign(input.services[0], { diagnostics: 'private content' });
  const summary = validateReport(input);
  assertCleanSummary(summary);
  assert.equal(JSON.stringify(summary).includes('private content'), false);
  assert.equal(JSON.stringify(summary).includes(imageId), false);
});

const invalidReports: [string, (r: SecurityReport) => void][] = [
  [
    'stale',
    (r) => {
      r.completedAt = new Date(Date.now() - 37 * 3600000).toISOString();
    },
  ],
  [
    'future',
    (r) => {
      r.completedAt = new Date(Date.now() + 3600000).toISOString();
    },
  ],
  [
    'missing service',
    (r) => {
      r.services.pop();
    },
  ],
  [
    'duplicate service',
    (r) => {
      r.services[0] = r.services[1];
    },
  ],
  [
    'negative count',
    (r) => {
      r.services[0].findings = -1;
    },
  ],
  [
    'false clean',
    (r) => {
      r.services[0].findings = 1;
    },
  ],
  [
    'missing identity',
    (r) => {
      delete r.services[0].imageId;
    },
  ],
];
for (const [name, mutate] of invalidReports) {
  test(`rejects ${name} report`, () => {
    const input = report();
    mutate(input);
    assert.throws(() => validateReport(input));
  });
}

test('findings and scanner errors cannot pass the workflow check', () => {
  for (const status of ['findings', 'error'] as const) {
    const input = report();
    Object.assign(input.services[0], { status, findings: status === 'error' ? null : 2 });
    assert.throws(() => assertCleanSummary(validateReport(input)));
  }
});

test('missing, malformed and oversized files fail closed', (t) => {
  const file = path.join(temporary(t), 'summary.json');
  assert.throws(() => readSummary(file));
  fs.writeFileSync(file, '{');
  assert.throws(() => readSummary(file));
  fs.writeFileSync(file, ' '.repeat(16385));
  assert.throws(() => readSummary(file));
});

function fakeRun({
  failure,
  changed = false,
  findings = 0,
}: { failure?: string; changed?: boolean; findings?: number } = {}): Command {
  let inspections = 0;
  return (binary, args) => {
    if (binary === 'docker') {
      inspections++;
      if (failure === 'container') throw new Error('missing');
      return JSON.stringify([changed ? String(inspections) : 'container', imageId, true]);
    }
    if (args.includes('--download-db-only')) {
      if (failure === 'database') throw new Error('offline');
      return '';
    }
    assert.equal(args.at(-1), imageId);
    assert.equal(args[args.indexOf('--image-src') + 1], 'docker');
    // Installed image packages are scanned; --include-dev-deps is fs-only.
    assert.equal(args.includes('--include-dev-deps'), false);
    if (failure === 'scanner') throw new Error('image inaccessible');
    if (failure === 'inventory') return JSON.stringify({ SchemaVersion: 2, Results: [] });
    return JSON.stringify({
      SchemaVersion: 2,
      Results: [
        {
          Target: 'fixture',
          Class: 'os-pkgs',
          Type: 'alpine',
          Packages: [{ Name: 'fixture', Version: '1' }],
          Vulnerabilities: Array.from({ length: findings }, () => ({ VulnerabilityID: 'TEST' })),
        },
      ],
    });
  };
}

test('scanner cannot report success without a real package inventory', () => {
  for (const Results of [
    [],
    [{}],
    [{ Target: 'uv.lock', Class: 'lang-pkgs', Type: 'uv', Packages: [] }],
  ]) {
    assert.throws(() => validateScan({ SchemaVersion: 2, Results }));
  }
  const target = {
    Target: 'uv.lock',
    Class: 'lang-pkgs',
    Type: 'uv',
    Packages: [{ Name: 'fixture', Version: '1' }],
  };
  assert.equal(validateScan({ SchemaVersion: 2, Results: [target] }, 'uv'), 0);
  assert.throws(() => validateScan({ SchemaVersion: 2, Results: [target] }, 'npm'));
  assert.throws(() =>
    validateScan({ SchemaVersion: 2, Results: [{ ...target, Vulnerabilities: {} }] })
  );
});

test('replacement of an earlier container before report publication is rejected', (t) => {
  const base = fakeRun();
  let inspections = 0;
  const run: Command = (binary, args) => {
    if (binary === 'docker' && ++inspections > 8 && args.at(-1) === 'emelmujiro-backend') {
      return JSON.stringify(['replacement', imageId, true]);
    }
    return base(binary, args);
  };
  const result = scan({ directory: temporary(t), run });
  assert.equal(result.services[0].status, 'error');
});

test('scans exact running images and writes an atomic readable summary', (t) => {
  const directory = temporary(t);
  scan({ directory, run: fakeRun() });
  assertCleanSummary(readSummary(path.join(directory, 'summary.json')));
  assert.equal(fs.readdirSync(directory).filter((name) => name.endsWith('.tmp')).length, 0);
});

for (const failure of ['container', 'database', 'scanner', 'inventory']) {
  test(`${failure} failure is never zero findings`, (t) => {
    const result = scan({ directory: temporary(t), run: fakeRun({ failure }) });
    assert.ok(
      result.services.every((entry) => entry.status === 'error' && entry.findings === null)
    );
  });
}

test('container replacement during scan invalidates the result', (t) => {
  const result = scan({ directory: temporary(t), run: fakeRun({ changed: true }) });
  assert.ok(result.services.every((entry) => entry.status === 'error'));
});

test('findings remain visible without stopping other image scans', (t) => {
  const result = scan({ directory: temporary(t), run: fakeRun({ findings: 2 }) });
  assert.ok(result.services.every((entry) => entry.status === 'findings' && entry.findings === 2));
});

const issueCases: [
  string,
  { number: number; title: string; body: string }[],
  string,
  string,
  string | undefined,
][] = [
  ['create', [], 'failure', 'success', 'create'],
  ['repeat', [{ number: 10, title: TITLE, body: MARKER }], 'success', 'failure', 'comment'],
  ['recovery', [{ number: 10, title: TITLE, body: MARKER }], 'success', 'success', 'close'],
  ['healthy', [], 'success', 'success', undefined],
  ['cancelled', [], 'cancelled', 'success', 'create'],
  [
    'unrelated issue',
    [{ number: 11, title: TITLE, body: 'human report' }],
    'failure',
    'success',
    'create',
  ],
];
for (const [name, existing, dependencies, production, expected] of issueCases) {
  test(`issue reconciliation: ${name}`, () => {
    const calls: { args: string[]; input?: string }[] = [];
    reconcile({
      run: (args, input) => {
        calls.push({ args, input });
        return JSON.stringify(existing);
      },
      repository: 'example/repo',
      runUrl: 'https://example.com/run',
      dependencies,
      production,
    });
    assert.equal(calls[1]?.args[1], expected);
    if (calls[1]?.input) assert.ok(calls[1].input.includes('https://example.com/run'));
  });
}

test('HTTP summary requires authentication and rejects stale or absent reports', async (t) => {
  const root = temporary(t);
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.mkdirSync(path.join(root, 'backend/logs/security'), { recursive: true });
  for (const file of [
    'package.json',
    'deploy-webhook.js',
    'deploy-webhook.ts',
    'security-report.ts',
    'security-runtime.ts',
  ]) {
    fs.copyFileSync(path.join(import.meta.dirname, file), path.join(root, 'scripts', file));
  }
  const child = spawn(process.execPath, [path.join(root, 'scripts/deploy-webhook.js')], {
    env: { ...process.env, DEPLOY_PORT: '0', DEPLOY_SECRET: 'test-only-secret' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill('SIGKILL'));
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Webhook did not start')), 5000);
    child.once('error', reject);
    child.stdout.on('data', (data) => {
      const match = String(data).match(/listening on 127\.0\.0\.1:(\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  const url = `http://127.0.0.1:${port}/security-status`;
  assert.equal((await fetch(url)).status, 401);
  assert.equal((await fetch(url, { headers: { 'X-Deploy-Secret': 'wrong' } })).status, 401);
  const options = { headers: { 'X-Deploy-Secret': 'test-only-secret' } };
  assert.equal((await fetch(url, options)).status, 503);
  const file = path.join(root, 'backend/logs/security/summary.json');
  const input = report();
  fs.writeFileSync(file, JSON.stringify(input));
  const response = await fetch(url, options);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const summary = await response.json();
  assertCleanSummary(summary);
  assert.equal(JSON.stringify(summary).includes(imageId), false);
  input.completedAt = '2000-01-01T00:00:00Z';
  fs.writeFileSync(file, JSON.stringify(input));
  assert.equal((await fetch(url, options)).status, 503);
  assert.equal((await fetch(url, { ...options, method: 'POST' })).status, 404);
  const deployUrl = `http://127.0.0.1:${port}/deploy`;
  assert.equal((await fetch(deployUrl, { method: 'POST' })).status, 401);
  assert.equal(
    (
      await fetch(deployUrl, {
        ...options,
        method: 'POST',
        body: JSON.stringify({ sha: 'invalid' }),
      })
    ).status,
    400
  );
});
