// cspell:ignore ignorefile
import fs from 'node:fs';
import path from 'node:path';
import { SERVICES } from './security-report.ts';
import type { Service, SecurityReport, ScanResult } from './security-report.ts';
import { validateScan } from './validate-security-scan.ts';
import { command, errorMessage, isMain, isRecord } from './security-runtime.ts';
import type { Command } from './security-runtime.ts';

function snapshot(run: Command, service: Service): { containerId: string; imageId: string } {
  const [containerId, imageId, running] = JSON.parse(
    run('docker', [
      'container',
      'inspect',
      '--format',
      '[{{json .Id}},{{json .Image}},{{json .State.Running}}]',
      `emelmujiro-${service}`,
    ])
  );
  if (
    running !== true ||
    typeof imageId !== 'string' ||
    typeof containerId !== 'string' ||
    !/^sha256:[a-f0-9]{64}$/.test(imageId) ||
    !containerId
  ) {
    throw new Error('Container is not running or has no image identity');
  }
  return { containerId, imageId };
}

export function scan({
  run = command,
  directory,
  trivy = 'trivy',
}: {
  run?: Command;
  directory: string;
  trivy?: string;
}): SecurityReport {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  let databaseReady = true;
  try {
    run(trivy, ['image', '--download-db-only', '--no-progress']);
    fs.rmSync(path.join(directory, 'database-error.log'), { force: true });
  } catch (error) {
    databaseReady = false;
    fs.writeFileSync(path.join(directory, 'database-error.log'), String(error), { mode: 0o600 });
  }
  const services = SERVICES.map((name): ScanResult => {
    try {
      if (!databaseReady) throw new Error('Vulnerability database refresh failed');
      const before = snapshot(run, name);
      // Restrict lookup to Docker. Never fall back to a registry tag when the
      // running image has become inaccessible in the containerd image store.
      const raw = run(trivy, [
        'image',
        '--image-src',
        'docker',
        '--scanners',
        'vuln',
        '--skip-db-update',
        '--ignorefile',
        '/dev/null',
        '--ignore-unfixed=false',
        '--severity',
        'UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL',
        '--format',
        'json',
        '--list-all-pkgs=true',
        '--exit-code',
        '0',
        '--timeout',
        '10m',
        '--no-progress',
        before.imageId,
      ]);
      const result = JSON.parse(raw);
      const findings = validateScan(result);
      const after = snapshot(run, name);
      if (before.containerId !== after.containerId || before.imageId !== after.imageId) {
        throw new Error('Container changed during scan');
      }
      fs.writeFileSync(path.join(directory, `${name}.json`), raw, { mode: 0o600 });
      fs.rmSync(path.join(directory, `${name}-error.log`), { force: true });
      return { name, ...before, status: findings ? 'findings' : 'clean', findings };
    } catch (error) {
      fs.writeFileSync(path.join(directory, `${name}-error.log`), String(error), { mode: 0o600 });
      return { name, status: 'error', findings: null };
    }
  });
  // A deploy may replace an earlier service while a later one is scanned.
  for (const entry of services) {
    if (entry.status === 'error') continue;
    try {
      const current = snapshot(run, entry.name);
      if (current.containerId !== entry.containerId || current.imageId !== entry.imageId) {
        throw new Error('Container changed before report publication');
      }
    } catch (error) {
      entry.status = 'error';
      entry.findings = null;
      fs.writeFileSync(path.join(directory, `${entry.name}-error.log`), String(error), {
        mode: 0o600,
      });
    }
  }
  const report: SecurityReport = { version: 1, completedAt: new Date().toISOString(), services };
  const temporary = path.join(directory, `summary-${process.pid}.tmp`);
  fs.writeFileSync(temporary, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(temporary, path.join(directory, 'summary.json'));
  return report;
}

if (isMain(import.meta.url)) {
  process.env.PATH = `/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`;
  const directory = path.resolve(import.meta.dirname, '../backend/logs/security');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const lock = path.join(directory, 'scan.lock');
  try {
    try {
      fs.writeFileSync(lock, String(process.pid), { flag: 'wx', mode: 0o600 });
    } catch (error) {
      if (!isRecord(error) || error.code !== 'EEXIST') throw error;
      const pid = Number(fs.readFileSync(lock, 'utf8'));
      if (!Number.isSafeInteger(pid) || pid <= 0)
        throw new Error('Invalid scanner lock; inspect it manually');
      try {
        process.kill(pid, 0);
        throw new Error('An image scan is already running');
      } catch (probe) {
        if (!isRecord(probe) || probe.code !== 'ESRCH') throw probe;
      }
      fs.unlinkSync(lock);
      fs.writeFileSync(lock, String(process.pid), { flag: 'wx', mode: 0o600 });
    }
    try {
      const report = scan({ directory, trivy: process.env.TRIVY_BIN || 'trivy' });
      console.log(
        JSON.stringify({
          completedAt: report.completedAt,
          services: report.services.map(({ name, status, findings }) => ({
            name,
            status,
            findings,
          })),
        })
      );
      if (report.services.some((entry) => entry.status !== 'clean')) process.exitCode = 1;
    } finally {
      fs.unlinkSync(lock);
    }
  } catch (error) {
    console.error(errorMessage(error));
    process.exitCode = 1;
  }
}
