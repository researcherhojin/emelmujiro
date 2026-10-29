import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { acquireLock } from './lock.ts';
import { REPO_ROOT } from '../shared/paths.ts';
import { ensurePrivateDir, writePrivate } from '../shared/private-fs.ts';

process.env.PATH = `/opt/homebrew/opt/openssl@3/bin:/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`;
const operation = process.argv[2];
const commands: Record<string, [string, string[]]> = {
  deploy: ['bash', [path.join(REPO_ROOT, 'scripts/deploy/auto-deploy.sh')]],
  security: [process.execPath, [path.join(REPO_ROOT, 'scripts/security/scheduled-security.ts')]],
  refresh: [process.execPath, [path.join(REPO_ROOT, 'scripts/maintenance/refresh-images.ts')]],
};
const lock = path.join(REPO_ROOT, 'backend/logs/maintenance.lock');
if (operation === 'check') {
  // The wrapper is the parent of the actual operation; a random environment flag
  // must not bypass locking during a direct invocation.
  const owner = JSON.parse(fs.readFileSync(lock, 'utf8'));
  if (owner.pid !== process.ppid && owner.pid !== Number(process.env.MAINTENANCE_OWNER)) {
    throw new Error('Maintenance owner mismatch');
  }
  if (owner.token !== process.env.MAINTENANCE_TOKEN) throw new Error('Maintenance token mismatch');
  process.kill(owner.pid, 0);
} else {
  if (!Object.hasOwn(commands, operation)) throw new Error('Unknown maintenance operation');
  if (operation === 'refresh') {
    const directory = path.join(REPO_ROOT, 'backend/logs/security/refresh');
    ensurePrivateDir(directory);
    writePrivate(
      path.join(directory, 'attempt.json'),
      JSON.stringify({ startedAt: new Date().toISOString() })
    );
  }
  const release = acquireLock(lock, operation);
  const owner = JSON.parse(fs.readFileSync(lock, 'utf8'));
  const [binary, args] = commands[operation];
  let interrupted = false;
  const child = spawn(binary, args, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    detached: true,
    env: { ...process.env, MAINTENANCE_OWNER: String(process.pid), MAINTENANCE_TOKEN: owner.token },
  });
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.on(signal, () => {
      interrupted = true;
      if (child.pid) {
        try {
          process.kill(-child.pid, signal);
        } catch {
          /* Already exited. */
        }
      }
    });
  }
  child.on('error', () => {
    release();
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    let descendants = false;
    if (child.pid) {
      try {
        process.kill(-child.pid, 0);
        descendants = true;
      } catch {
        /* Group exited. */
      }
    }
    if (!interrupted && !signal && !descendants) release();
    else
      console.error('Maintenance interrupted; inspect processes before removing maintenance.lock');
    process.exitCode = code === 0 && !signal && !interrupted && !descendants ? 0 : 1;
  });
}
