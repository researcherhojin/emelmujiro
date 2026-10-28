import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
import { REPO_ROOT, SECURITY_REPORT_ROOT, trivyBinary } from './shared/paths.ts';
import { refreshImages } from './maintenance/refresh.ts';

const maintenance = path.join(REPO_ROOT, 'scripts/maintenance.ts');
if (!process.env.MAINTENANCE_TOKEN) {
  const result = spawnSync(process.execPath, [maintenance, 'refresh'], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
if (spawnSync(process.execPath, [maintenance, 'check'], { stdio: 'inherit' }).status !== 0)
  process.exit(1);
process.umask(0o077);
const directory = path.join(SECURITY_REPORT_ROOT, 'refresh');
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
const config = fs.mkdtempSync(path.join(directory, 'docker-config-'));
try {
  const original = path.join(os.homedir(), '.docker');
  const settings = JSON.parse(fs.readFileSync(path.join(original, 'config.json'), 'utf8'));
  delete settings.credsStore;
  delete settings.credHelpers;
  settings.auths = {};
  fs.writeFileSync(path.join(config, 'config.json'), JSON.stringify(settings), { mode: 0o600 });
  for (const name of ['contexts', 'buildx', 'cli-plugins']) {
    const source = path.join(original, name);
    if (fs.existsSync(source)) fs.cpSync(source, path.join(config, name), { recursive: true });
  }
  const log = fs.openSync(path.join(directory, 'commands.log'), 'w', 0o600);
  try {
    const result = refreshImages({
      root: REPO_ROOT,
      directory,
      trivy: trivyBinary(),
      run: (binary, args) => {
        fs.writeSync(log, JSON.stringify({ binary, args }) + '\n');
        const output = execFileSync(binary, args, {
          cwd: REPO_ROOT,
          env: { ...process.env, DOCKER_CONFIG: config },
          timeout: 60 * 60 * 1000,
          maxBuffer: 128 * 1024 * 1024,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', log],
        });
        fs.writeSync(log, output);
        return output;
      },
    });
    console.log(
      JSON.stringify({ success: result.success, phase: result.phase, recovery: result.recovery })
    );
    if (!result.success) process.exitCode = 1;
  } finally {
    fs.closeSync(log);
  }
} finally {
  fs.rmSync(config, { recursive: true, force: true });
}
