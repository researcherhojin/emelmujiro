import fs from 'node:fs';
import path from 'node:path';

export const SCRIPTS_ROOT = path.resolve(import.meta.dirname, '..');
export const REPO_ROOT = path.resolve(SCRIPTS_ROOT, '..');
export const SECURITY_REPORT_ROOT = path.join(REPO_ROOT, 'backend/logs/security');

export function trivyBinary(): string {
  if (process.env.TRIVY_BIN) {
    return process.env.TRIVY_BIN.includes('/')
      ? path.resolve(process.env.TRIVY_BIN)
      : process.env.TRIVY_BIN;
  }
  const installed = path.join(REPO_ROOT, 'backend/.cache/security-tools/trivy');
  return fs.existsSync(installed) ? installed : 'trivy';
}
