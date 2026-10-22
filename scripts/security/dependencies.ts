// cspell:ignore ignorefile pkgs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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

export function scanDependencies({
  root,
  directory,
  trivy,
  run = runCommand,
}: {
  root: string;
  directory: string;
  trivy: string;
  run?: Runner;
}): boolean {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  let clean = true;
  const check = (
    name: string,
    binary: string,
    args: string[],
    validate: (value: unknown) => number
  ) => {
    try {
      const result = run(binary, args, root);
      fs.writeFileSync(path.join(directory, `${name}.json`), result.stdout, { mode: 0o600 });
      fs.writeFileSync(path.join(directory, `${name}.log`), result.stderr, { mode: 0o600 });
      const findings = validate(JSON.parse(result.stdout));
      if (result.status !== 0 || findings !== 0) clean = false;
      console.log(`${name}: ${findings} findings, scanner exit ${result.status}`);
    } catch (error) {
      clean = false;
      fs.writeFileSync(path.join(directory, `${name}.log`), String(error), { mode: 0o600 });
      console.error(`${name}: scan failed; see the local report`);
    }
  };
  check('npm-audit', 'npm', ['audit', '--include=dev', '--audit-level=low', '--json'], (value) => {
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
    return value.metadata.vulnerabilities.total;
  });
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
        '/dev/null',
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
