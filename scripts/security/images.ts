// cspell:ignore ignorefile
import fs from 'node:fs';
import path from 'node:path';
import { SERVICES } from './report.ts';
import type { Service, SecurityReport, ScanResult } from './report.ts';
import { validateScan } from './scan-report.ts';
import { ensurePrivateDir, writePrivate, writePrivateAtomic } from '../shared/private-fs.ts';
import { command } from '../shared/runtime.ts';
import type { Command } from '../shared/runtime.ts';

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
  ensurePrivateDir(directory);
  let databaseReady = true;
  try {
    run(trivy, ['image', '--download-db-only', '--no-progress']);
    fs.rmSync(path.join(directory, 'database-error.log'), { force: true });
  } catch (error) {
    databaseReady = false;
    writePrivate(path.join(directory, 'database-error.log'), String(error));
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
      writePrivate(path.join(directory, `${name}.json`), raw);
      fs.rmSync(path.join(directory, `${name}-error.log`), { force: true });
      return { name, ...before, status: findings ? 'findings' : 'clean', findings };
    } catch (error) {
      writePrivate(path.join(directory, `${name}-error.log`), String(error));
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
      writePrivate(path.join(directory, `${entry.name}-error.log`), String(error));
    }
  }
  const report: SecurityReport = { version: 1, completedAt: new Date().toISOString(), services };
  writePrivateAtomic(
    path.join(directory, 'summary.json'),
    path.join(directory, `summary-${process.pid}.tmp`),
    JSON.stringify(report, null, 2) + '\n'
  );
  return report;
}
