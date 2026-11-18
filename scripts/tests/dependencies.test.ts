// cspell:ignore ignorefile
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  IGNORE_FILES,
  LOCK_TARGETS,
  NPM_AUDIT_IGNORE,
  countAuditFindings,
  readAuditIgnores,
  scanDependencies,
} from '../security/dependencies.ts';
import { REPO_ROOT } from '../shared/paths.ts';

for (const failure of ['none', 'npm', 'trivy', 'empty', 'missing']) {
  test(`dependency audit handles ${failure} with paths containing spaces`, (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit fixture '));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    for (const [target] of LOCK_TARGETS) {
      fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
      fs.writeFileSync(path.join(root, target), 'fixture');
    }
    if (failure === 'missing') fs.unlinkSync(path.join(root, 'backend/uv.lock'));
    const visited: string[] = [];
    const clean = scanDependencies({
      root,
      directory: path.join(root, 'reports'),
      trivy: '/a path/trivy',
      run(binary, args, cwd) {
        assert.equal(cwd, root);
        visited.push(binary);
        if (binary === 'npm')
          return {
            status: failure === 'npm' ? 1 : 0,
            stdout: JSON.stringify({
              metadata: { vulnerabilities: { total: failure === 'npm' ? 1 : 0 } },
            }),
            stderr: '',
          };
        const target = args.at(-1)!;
        assert.ok(path.isAbsolute(target));
        assert.ok(target.startsWith(root));
        const [file, type] = LOCK_TARGETS.find(([file]) => path.join(root, file) === target)!;
        const ignore = IGNORE_FILES[file];
        assert.equal(
          args[args.indexOf('--ignorefile') + 1],
          ignore ? path.join(root, ignore) : '/dev/null'
        );
        if (failure === 'trivy') throw new Error('Scanner unavailable');
        return {
          status: 0,
          stderr: '',
          stdout: JSON.stringify({
            SchemaVersion: 2,
            Results:
              failure === 'empty'
                ? []
                : [
                    {
                      Target: target,
                      Class: 'lang-pkgs',
                      Type: type,
                      Packages: [{ Name: 'fixture', Version: '1' }],
                    },
                  ],
          }),
        };
      },
    });
    assert.equal(clean, failure === 'none');
    assert.equal(visited.length, failure === 'missing' ? 4 : 5);
  });
}

const ID = 'GHSA-fc5q-39xc-vjpf';
const advisory = (name: string, id = ID) => ({
  source: 1,
  name,
  url: `https://github.com/advisories/${id}`,
});
const audit = (vulnerabilities: Record<string, { via: unknown[] }>) => ({
  vulnerabilities,
  metadata: { vulnerabilities: { total: Object.keys(vulnerabilities).length } },
});
const ignores = (expires = '2026-12-02') =>
  JSON.stringify([{ id: ID, packages: ['picomatch'], expires, statement: 'why' }]);
const devLock = (dev: boolean) => ({
  packages: {
    'node_modules/picomatch': { version: '4.0.7', dev: true },
    'node_modules/x/node_modules/picomatch': { version: '4.0.7', dev },
  },
});
const tree = audit({ picomatch: { via: [advisory('picomatch')] }, vite: { via: ['picomatch'] } });

test('an unexpired ignore accepts a dev-only advisory and the parents that only inherit it', () => {
  assert.equal(
    countAuditFindings(tree, readAuditIgnores(ignores(), '2026-12-01'), devLock(true)),
    0
  );
});

test('an npm audit ignore stops applying when it expires or the package ships', () => {
  assert.equal(
    countAuditFindings(tree, readAuditIgnores(ignores(), '2026-12-02'), devLock(true)),
    2
  );
  assert.equal(
    countAuditFindings(tree, readAuditIgnores(ignores(), '2026-11-18'), devLock(false)),
    2
  );
  assert.equal(countAuditFindings(tree, readAuditIgnores(ignores(), '2026-11-18'), {}), 2);
});

test('an npm audit ignore never hides another advisory or package', () => {
  const accepted = readAuditIgnores(ignores(), '2026-11-18');
  const other = audit({
    picomatch: { via: [advisory('picomatch')] },
    vite: { via: ['picomatch', advisory('vite', 'GHSA-2222-3333-4444')] },
    knip: { via: ['vite'] },
  });
  assert.equal(countAuditFindings(other, accepted, devLock(true)), 2);
  const renamed = audit({ micromatch: { via: [advisory('micromatch')] } });
  assert.equal(countAuditFindings(renamed, accepted, devLock(true)), 1);
  const listed = { ...tree, metadata: { vulnerabilities: { total: 3 } } };
  assert.throws(() => countAuditFindings(listed, accepted, devLock(true)));
});

test('a malformed npm audit ignore entry fails the scan', () => {
  for (const entry of [
    { id: 'CVE-2026-1', packages: ['x'], expires: '2026-12-02', statement: 'why' },
    { id: ID, packages: [], expires: '2026-12-02', statement: 'why' },
    { id: ID, packages: ['x'], expires: 'soon', statement: 'why' },
    { id: ID, packages: ['x'], expires: '2026-12-02', statement: ' ' },
  ])
    assert.throws(() => readAuditIgnores(JSON.stringify([entry]), '2026-11-18'));
  assert.throws(() => readAuditIgnores('{}', '2026-11-18'));
});

test('the tracked npm audit ignore file parses', () => {
  readAuditIgnores(fs.readFileSync(path.join(REPO_ROOT, NPM_AUDIT_IGNORE), 'utf8'), '2026-01-01');
});

test('npm audit exit 1 is clean when every finding is accepted', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit ignore '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [target] of LOCK_TARGETS) {
    fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
    fs.writeFileSync(path.join(root, target), 'fixture');
  }
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify(devLock(true)));
  fs.mkdirSync(path.dirname(path.join(root, NPM_AUDIT_IGNORE)), { recursive: true });
  const scan = (expires: string, status: number) => {
    fs.writeFileSync(path.join(root, NPM_AUDIT_IGNORE), ignores(expires));
    return scanDependencies({
      root,
      directory: path.join(root, 'reports'),
      trivy: 'trivy',
      today: '2026-11-18',
      run(binary, args) {
        if (binary === 'npm') return { status, stdout: JSON.stringify(tree), stderr: '' };
        const [, type] = LOCK_TARGETS.find(([file]) => path.join(root, file) === args.at(-1))!;
        return {
          status: 0,
          stderr: '',
          stdout: JSON.stringify({
            SchemaVersion: 2,
            Results: [
              {
                Target: 'x',
                Class: 'lang-pkgs',
                Type: type,
                Packages: [{ Name: 'a', Version: '1' }],
              },
            ],
          }),
        };
      },
    });
  };
  assert.equal(scan('2026-12-02', 1), true);
  assert.equal(scan('2026-11-18', 1), false);
  // A listed finding with exit 0 means npm did not apply the audit level.
  assert.equal(scan('2026-12-02', 0), false);
});
