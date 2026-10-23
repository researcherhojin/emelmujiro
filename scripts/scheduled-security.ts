import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, SECURITY_REPORT_ROOT } from './shared/paths.ts';
import { runOperations } from './security/operations.ts';
import { isRecord } from './shared/runtime.ts';

process.env.PATH = `/opt/homebrew/opt/openssl@3/bin:/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`;
fs.mkdirSync(SECURITY_REPORT_ROOT, { recursive: true, mode: 0o700 });
const lock = path.join(SECURITY_REPORT_ROOT, 'operations.lock');
try {
  try {
    fs.writeFileSync(lock, String(process.pid), { flag: 'wx', mode: 0o600 });
  } catch (error) {
    if (!isRecord(error) || error.code !== 'EEXIST') throw error;
    const pid = Number(fs.readFileSync(lock, 'utf8'));
    if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error('Invalid operations lock');
    try {
      process.kill(pid, 0);
      throw new Error('Operations already running');
    } catch (probe) {
      if (!isRecord(probe) || probe.code !== 'ESRCH') throw probe;
    }
    fs.unlinkSync(lock);
    fs.writeFileSync(lock, String(process.pid), { flag: 'wx', mode: 0o600 });
  }
  try {
    const report = runOperations(REPO_ROOT, SECURITY_REPORT_ROOT);
    console.log(JSON.stringify(report));
    if (!report.backup || !report.dependencies || !report.images || !report.offsite)
      process.exitCode = 1;
  } finally {
    fs.unlinkSync(lock);
  }
} catch {
  console.error('Scheduled security operations failed; inspect private logs');
  process.exitCode = 1;
}
