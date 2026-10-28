import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { isRecord } from '../shared/runtime.ts';

export type OperationsReport = {
  version: 1;
  completedAt: string;
  dependencies: boolean;
  images: boolean;
  backup: boolean;
  offsite: boolean;
  refresh?: boolean;
};

export function validateOperations(value: unknown, now = Date.now()): OperationsReport {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.completedAt !== 'string' ||
    typeof value.dependencies !== 'boolean' ||
    typeof value.images !== 'boolean' ||
    typeof value.backup !== 'boolean' ||
    typeof value.offsite !== 'boolean'
  )
    throw new Error('Invalid operations report');
  const age = now - Date.parse(value.completedAt);
  if (!Number.isFinite(age) || age < -300000 || age > 36 * 3600000) {
    throw new Error('Operations report is stale');
  }
  return {
    version: 1,
    completedAt: value.completedAt,
    dependencies: value.dependencies,
    images: value.images,
    backup: value.backup,
    offsite: value.offsite,
  };
}

export function offsiteFresh(directory: string, now = Date.now()): boolean {
  try {
    const file = path.join(directory, 'offsite.json');
    if (fs.statSync(file).size > 4096) return false;
    const value: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (
      !isRecord(value) ||
      value.version !== 1 ||
      typeof value.backup !== 'string' ||
      !/^\d{8}T\d{6}Z-[a-f0-9]{8}\.cms$/.test(value.backup)
    )
      return false;
    return ['completedAt', 'backedUpAt'].every((key) => {
      if (typeof value[key] !== 'string') return false;
      const age = now - Date.parse(value[key]);
      return Number.isFinite(age) && age >= -300000 && age <= 36 * 3600000;
    });
  } catch {
    return false;
  }
}

export function readOperations(file: string): OperationsReport {
  if (fs.statSync(file).size > 4096) throw new Error('Report too large');
  const report = validateOperations(JSON.parse(fs.readFileSync(file, 'utf8')));
  report.offsite = offsiteFresh(path.dirname(file));
  report.refresh = refreshFresh(path.dirname(file));
  return report;
}

export type Runner = (binary: string, args: string[], log: string) => boolean;
const runOperation: Runner = (binary, args, log) => {
  const fd = fs.openSync(log, 'w', 0o600);
  try {
    const result = spawnSync(binary, args, { stdio: ['ignore', fd, fd], timeout: 60 * 60 * 1000 });
    return !result.error && result.status === 0;
  } finally {
    fs.closeSync(fd);
  }
};

export function runOperations(
  root: string,
  directory: string,
  run: Runner = runOperation
): OperationsReport {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const check = (name: string, binary: string, args: string[]) => {
    try {
      return run(binary, args, path.join(directory, `${name}-scheduled.log`));
    } catch {
      return false;
    }
  };
  const backup = check('backup', 'python3', [path.join(root, 'scripts/backup-verify.py')]);
  const dependencies = check('dependencies', process.execPath, [
    path.join(root, 'scripts/scan-dependencies.ts'),
  ]);
  const images = check('images', process.execPath, [
    path.join(root, 'scripts/scan-running-images.ts'),
  ]);
  const report: OperationsReport = {
    version: 1,
    completedAt: new Date().toISOString(),
    dependencies,
    images,
    backup,
    offsite: offsiteFresh(directory),
  };
  const temporary = path.join(directory, `operations-${process.pid}.tmp`);
  fs.writeFileSync(temporary, JSON.stringify(report) + '\n', { mode: 0o600 });
  fs.renameSync(temporary, path.join(directory, 'operations.json'));
  return report;
}

// Disabled until the owner explicitly installs the refresh schedule.
export function refreshFresh(directory: string, now = Date.now()): boolean {
  if (!fs.existsSync(path.join(directory, 'refresh-enabled'))) return true;
  try {
    const file = path.join(directory, 'refresh/latest.json');
    if (fs.statSync(file).size > 16384) return false;
    const value: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    const attempt: unknown = JSON.parse(
      fs.readFileSync(path.join(directory, 'refresh/attempt.json'), 'utf8')
    );
    if (
      !isRecord(value) ||
      !isRecord(attempt) ||
      value.version !== 1 ||
      value.success !== true ||
      value.phase !== 'complete' ||
      value.recovery !== 'not-needed' ||
      typeof value.source !== 'string' ||
      !/^[a-f0-9]{40}$/.test(value.source) ||
      typeof value.startedAt !== 'string' ||
      typeof value.completedAt !== 'string' ||
      typeof attempt.startedAt !== 'string'
    )
      return false;
    const start = Date.parse(value.startedAt),
      end = Date.parse(value.completedAt),
      tried = Date.parse(attempt.startedAt);
    if (
      ![start, end, tried].every(Number.isFinite) ||
      start > end ||
      end < tried ||
      end > now + 300000 ||
      now - end > 36 * 3600000
    )
      return false;
    for (const service of ['backend', 'umami', 'umami-db']) {
      if (
        !isRecord(value.candidates) ||
        !isRecord(value.running) ||
        typeof value.running[service] !== 'string' ||
        !/^sha256:[a-f0-9]{64}$/.test(value.running[service]) ||
        value.running[service] !== value.candidates[service]
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
}
