import fs from 'node:fs';
import path from 'node:path';
import { scan } from './security/images.ts';
import { SECURITY_REPORT_ROOT, trivyBinary } from './shared/paths.ts';
import { errorMessage, isMain, isRecord } from './shared/runtime.ts';

if (isMain(import.meta.url)) {
  process.env.PATH = `/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`;
  const directory = SECURITY_REPORT_ROOT;
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
      const report = scan({ directory, trivy: trivyBinary() });
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
