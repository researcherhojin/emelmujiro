import fs from 'node:fs';
import { execFile } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';

const LOCK_MAX_AGE_MS = 15 * 60 * 1000;
function timestamp(): string {
  return new Date().toISOString();
}

export function createDeploymentManager({
  script,
  lockFile,
}: {
  script: string;
  lockFile: string;
}) {
  let deployChild: ChildProcess | null = null;

  function isProcessAlive(pid: number) {
    try {
      process.kill(pid, 0);
      return true;
    } catch (_) {
      return false;
    }
  }

  function isDeploying() {
    if (!fs.existsSync(lockFile)) return false;
    try {
      const stat = fs.statSync(lockFile);
      const age = Date.now() - stat.mtimeMs;
      if (age > LOCK_MAX_AGE_MS) {
        console.log(`[${timestamp()}] Removing stale lock file (age: ${Math.round(age / 1000)}s)`);
        fs.unlinkSync(lockFile);
        return false;
      }
      const pid = parseInt(fs.readFileSync(lockFile, 'utf8').trim(), 10);
      if (pid && !isProcessAlive(pid)) {
        console.log(`[${timestamp()}] Removing orphaned lock file (PID ${pid} no longer running)`);
        fs.unlinkSync(lockFile);
        return false;
      }
      return true;
    } catch (_) {
      releaseLock();
      return false;
    }
  }

  function acquireLock(pid: number) {
    fs.writeFileSync(lockFile, String(pid));
  }

  function releaseLock() {
    deployChild = null;
    try {
      fs.unlinkSync(lockFile);
    } catch (_) {
      /* ignore */
    }
  }

  function startDeploy(sha: string, accepted: () => void): boolean {
    if (isDeploying()) {
      console.log(`[${timestamp()}] Deploy already in progress, skipping`);
      return false;
    }

    acquireLock(process.pid);
    console.log(
      `[${timestamp()}] Deploy triggered${sha ? ` for ${sha.slice(0, 8)}` : ' (no sha \u2014 falling back to origin/main)'}`
    );

    accepted();

    deployChild = execFile(
      'bash',
      [script],
      { timeout: 600000, env: { ...process.env, DEPLOY_SHA: sha } },
      (error, stdout, stderr) => {
        releaseLock();
        if (error) {
          console.error(`[${timestamp()}] Deploy failed:`, error.message);
          if (stderr) console.error(stderr);
        } else {
          console.log(`[${timestamp()}] Deploy completed successfully`);
        }
        if (stdout) console.log(stdout);
      }
    );

    // Update lock with child PID so orphan detection works if webhook dies
    if (deployChild.pid) acquireLock(deployChild.pid);
    return true;
  }

  return {
    isDeploying,
    startDeploy,
    shutdown() {
      if (deployChild) deployChild.kill();
      releaseLock();
    },
  };
}
