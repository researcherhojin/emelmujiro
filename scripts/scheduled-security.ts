import path from 'node:path';
import { REPO_ROOT, SECURITY_REPORT_ROOT } from './shared/paths.ts';
import { runOperations } from './security/operations.ts';
import { enterMaintenance } from './shared/maintenance-entry.ts';
import { withPidLock } from './shared/pid-lock.ts';
import { ensurePrivateDir } from './shared/private-fs.ts';

enterMaintenance('security');

process.env.PATH = `/opt/homebrew/opt/openssl@3/bin:/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`;
ensurePrivateDir(SECURITY_REPORT_ROOT);
const lock = path.join(SECURITY_REPORT_ROOT, 'operations.lock');
try {
  withPidLock(
    lock,
    { invalid: 'Invalid operations lock', busy: 'Operations already running' },
    () => {
      const report = runOperations(REPO_ROOT, SECURITY_REPORT_ROOT);
      console.log(JSON.stringify(report));
      if (!report.backup || !report.dependencies || !report.images || !report.offsite)
        process.exitCode = 1;
    }
  );
} catch {
  console.error('Scheduled security operations failed; inspect private logs');
  process.exitCode = 1;
}
