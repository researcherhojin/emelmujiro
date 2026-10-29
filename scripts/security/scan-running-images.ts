import path from 'node:path';
import { scan } from './images.ts';
import { SECURITY_REPORT_ROOT, trivyBinary } from '../shared/paths.ts';
import { withPidLock } from '../shared/pid-lock.ts';
import { ensurePrivateDir } from '../shared/private-fs.ts';
import { errorMessage, isMain } from '../shared/runtime.ts';

if (isMain(import.meta.url)) {
  process.env.PATH = `/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`;
  const directory = SECURITY_REPORT_ROOT;
  ensurePrivateDir(directory);
  try {
    withPidLock(
      path.join(directory, 'scan.lock'),
      {
        invalid: 'Invalid scanner lock; inspect it manually',
        busy: 'An image scan is already running',
      },
      () => {
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
      }
    );
  } catch (error) {
    console.error(errorMessage(error));
    process.exitCode = 1;
  }
}
