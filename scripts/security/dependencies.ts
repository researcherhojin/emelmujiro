// cspell:ignore ignorefile pkgs cfghjmpqrvwx
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ensurePrivateDir, writePrivate } from '../shared/private-fs.ts';
import { isRecord } from '../shared/runtime.ts';
import { validateScan } from './scan-report.ts';

type Result = { status: number; stdout: string; stderr: string };
type Runner = (binary: string, args: string[], cwd: string) => Result;
const runCommand: Runner = (binary, args, cwd) => {
  const result = spawnSync(binary, args, {
    cwd,
    encoding: 'utf8',
    timeout: 12 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status === null) throw new Error('Scanner terminated without an exit status');
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
};

export const LOCK_TARGETS = [
  ['package-lock.json', 'npm'],
  ['backend/uv.lock', 'uv'],
  ['docker/umami/pnpm-lock.yaml', 'pnpm'],
  ['docker/umami/runner/pnpm-lock.yaml', 'pnpm'],
] as const;

// Accepted risks are scoped per lock file and expire; every other target
// keeps an empty ignore file, so no exception can hide its findings.
export const IGNORE_FILES: Partial<Record<(typeof LOCK_TARGETS)[number][0], string>> = {
  'package-lock.json': 'scripts/security/package-lock.trivyignore.yaml',
  'docker/umami/pnpm-lock.yaml': 'docker/umami/trivyignore.yaml',
};

// npm audit has no ignore file of its own. An entry accepts one advisory for the
// named packages up to the day before `expires`, as Trivy's `expired_at` does,
// and only while every copy of each package in package-lock.json is dev-only;
// anything else in the file fails the scan.
export const NPM_AUDIT_IGNORE = 'scripts/security/npm-audit-ignore.json';

export function readAuditIgnores(text: string, today: string): Map<string, Set<string>> {
  const value: unknown = JSON.parse(text);
  if (!Array.isArray(value)) throw new Error('npm audit ignore file is not a list');
  const accepted = new Map<string, Set<string>>();
  for (const entry of value) {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      !/^GHSA(-[23456789cfghjmpqrvwx]{4}){3}$/.test(entry.id) ||
      !Array.isArray(entry.packages) ||
      entry.packages.length === 0 ||
      !entry.packages.every((name) => typeof name === 'string' && name.length > 0) ||
      typeof entry.expires !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.expires) ||
      typeof entry.statement !== 'string' ||
      !entry.statement.trim()
    )
      throw new Error('invalid npm audit ignore entry');
    if (entry.expires > today) accepted.set(entry.id, new Set(entry.packages as string[]));
  }
  return accepted;
}

export function countAuditFindings(
  value: unknown,
  accepted: Map<string, Set<string>>,
  lock: unknown
): number {
  if (
    !isRecord(value) ||
    value.error ||
    !isRecord(value.metadata) ||
    !isRecord(value.metadata.vulnerabilities) ||
    typeof value.metadata.vulnerabilities.total !== 'number' ||
    !Number.isSafeInteger(value.metadata.vulnerabilities.total) ||
    value.metadata.vulnerabilities.total < 0
  ) {
    throw new Error('npm returned no valid audit result');
  }
  const total = value.metadata.vulnerabilities.total;
  if (total === 0 || accepted.size === 0) return total;
  const vulnerabilities = value.vulnerabilities;
  if (!isRecord(vulnerabilities) || Object.keys(vulnerabilities).length !== total)
    throw new Error('npm audit result does not list its vulnerabilities');
  const packages = isRecord(lock) && isRecord(lock.packages) ? lock.packages : {};
  const devOnly = (name: string) => {
    const copies = Object.entries(packages).filter(([key]) => key.endsWith(`node_modules/${name}`));
    return copies.length > 0 && copies.every(([, entry]) => isRecord(entry) && entry.dev === true);
  };
  const ignored = (via: Record<string, unknown>) => {
    const id =
      typeof via.url === 'string' ? via.url.match(/\/advisories\/(GHSA-[\w-]+)$/)?.[1] : null;
    return (
      !!id && typeof via.name === 'string' && !!accepted.get(id)?.has(via.name) && devOnly(via.name)
    );
  };
  // A package is accepted when every path in its `via` ends at an ignored
  // advisory; parents that only inherit one follow their child.
  const ok = new Map(Object.keys(vulnerabilities).map((name) => [name, true]));
  for (let changed = true; changed;) {
    changed = false;
    for (const [name, entry] of Object.entries(vulnerabilities)) {
      if (!ok.get(name)) continue;
      const via = isRecord(entry) && Array.isArray(entry.via) ? entry.via : [];
      const fine =
        via.length > 0 &&
        via.every((item) =>
          typeof item === 'string' ? ok.get(item) === true : isRecord(item) && ignored(item)
        );
      if (!fine) {
        ok.set(name, false);
        changed = true;
      }
    }
  }
  return [...ok.values()].filter((fine) => !fine).length;
}

export function scanDependencies({
  root,
  directory,
  trivy,
  run = runCommand,
  today = new Date().toISOString().slice(0, 10),
}: {
  root: string;
  directory: string;
  trivy: string;
  run?: Runner;
  today?: string;
}): boolean {
  ensurePrivateDir(directory);
  let clean = true;
  const check = (
    name: string,
    binary: string,
    args: string[],
    validate: (value: unknown) => number,
    expectedStatus: (value: unknown) => number = () => 0
  ) => {
    try {
      const result = run(binary, args, root);
      writePrivate(path.join(directory, `${name}.json`), result.stdout);
      writePrivate(path.join(directory, `${name}.log`), result.stderr);
      const value: unknown = JSON.parse(result.stdout);
      const findings = validate(value);
      if (result.status !== expectedStatus(value) || findings !== 0) clean = false;
      console.log(`${name}: ${findings} findings, scanner exit ${result.status}`);
    } catch (error) {
      clean = false;
      writePrivate(path.join(directory, `${name}.log`), String(error));
      console.error(`${name}: scan failed; see the local report`);
    }
  };
  check(
    'npm-audit',
    'npm',
    ['audit', '--include=dev', '--audit-level=low', '--json'],
    (value) => {
      const ignoreFile = path.join(root, NPM_AUDIT_IGNORE);
      const accepted = fs.existsSync(ignoreFile)
        ? readAuditIgnores(fs.readFileSync(ignoreFile, 'utf8'), today)
        : new Map<string, Set<string>>();
      const lockFile = path.join(root, 'package-lock.json');
      const lock = accepted.size > 0 ? JSON.parse(fs.readFileSync(lockFile, 'utf8')) : null;
      return countAuditFindings(value, accepted, lock);
    },
    // npm exits 1 whenever it lists any finding, accepted or not.
    (value) =>
      isRecord(value) && isRecord(value.metadata) && isRecord(value.metadata.vulnerabilities)
        ? Number(value.metadata.vulnerabilities.total !== 0)
        : 0
  );
  for (const [target, type] of LOCK_TARGETS) {
    const name = target.replaceAll('/', '-');
    if (!fs.existsSync(path.join(root, target))) {
      console.error(`Missing lock file: ${target}`);
      clean = false;
      continue;
    }
    check(
      name,
      trivy,
      [
        'fs',
        '--scanners',
        'vuln',
        '--include-dev-deps',
        '--ignorefile',
        IGNORE_FILES[target] ? path.join(root, IGNORE_FILES[target]) : '/dev/null',
        '--ignore-unfixed=false',
        '--severity',
        'UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL',
        '--format',
        'json',
        '--list-all-pkgs=true',
        '--exit-code',
        '1',
        '--timeout',
        '10m',
        path.join(root, target),
      ],
      (value) => validateScan(value, type)
    );
  }
  return clean;
}
