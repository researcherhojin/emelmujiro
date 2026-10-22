import fs from 'node:fs';
import { errorMessage, isMain, isRecord } from './security-runtime.ts';

export const SERVICES = ['backend', 'frontend', 'umami', 'umami-db'] as const;
export type Service = (typeof SERVICES)[number];
export type ScanResult = {
  name: Service;
  status: 'clean' | 'findings' | 'error';
  findings: number | null;
  imageId?: string;
  containerId?: string;
};
export type SecurityReport = { version: 1; completedAt: string; services: ScanResult[] };
const MAX_AGE_MS = 36 * 60 * 60 * 1000;

export function validateReport(
  report: unknown,
  now = Date.now(),
  requireIdentity = true
): SecurityReport {
  if (
    !isRecord(report) ||
    report.version !== 1 ||
    !Array.isArray(report.services) ||
    typeof report.completedAt !== 'string'
  )
    throw new Error('Invalid security report');
  const completed = Date.parse(report.completedAt);
  if (!Number.isFinite(completed) || completed > now + 300000 || now - completed > MAX_AGE_MS) {
    throw new Error('Security report is stale or has an invalid timestamp');
  }
  const entries: unknown[] = report.services;
  if (entries.length !== SERVICES.length) throw new Error('Incomplete service inventory');
  const services = SERVICES.map((name): ScanResult => {
    const matches = entries.filter((entry) => isRecord(entry) && entry.name === name);
    if (matches.length !== 1 || !isRecord(matches[0])) throw new Error('Invalid service inventory');
    const entry = matches[0];
    if (entry.status === 'error' && entry.findings === null)
      return { name, status: 'error', findings: null };
    if (entry.status !== 'clean' && entry.status !== 'findings')
      throw new Error('Invalid scan status');
    if (
      (requireIdentity &&
        (typeof entry.imageId !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(entry.imageId))) ||
      typeof entry.findings !== 'number' ||
      !Number.isSafeInteger(entry.findings) ||
      entry.findings < 0 ||
      (entry.status === 'clean') !== (entry.findings === 0)
    )
      throw new Error('Invalid scan result');
    // Do not expose image IDs, package inventories or scanner diagnostics.
    return { name, status: entry.status, findings: entry.findings };
  });
  return { version: 1, completedAt: report.completedAt, services };
}
export function readSummary(file: string, now?: number): SecurityReport {
  if (fs.statSync(file).size > 16384) throw new Error('Security report too large');
  return validateReport(JSON.parse(fs.readFileSync(file, 'utf8')), now);
}
export function assertCleanSummary(summary: unknown, now = Date.now()): void {
  const report = validateReport(summary, now, false);
  if (report.services.some((entry) => entry.status !== 'clean')) {
    throw new Error('Production scan has findings or incomplete scans');
  }
}
if (isMain(import.meta.url)) {
  try {
    assertCleanSummary(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
    console.log('Fresh production scan: every service is clean');
  } catch (error) {
    console.error(errorMessage(error));
    process.exitCode = 1;
  }
}
