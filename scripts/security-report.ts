import fs from 'node:fs';
import path from 'node:path';
import { assertCleanSummary } from './security/report.ts';
import { errorMessage, isMain } from './shared/runtime.ts';
import { SECURITY_REPORT_ROOT } from './shared/paths.ts';

if (isMain(import.meta.url)) {
  try {
    const file = process.argv[2] || path.join(SECURITY_REPORT_ROOT, 'summary.json');
    assertCleanSummary(JSON.parse(fs.readFileSync(file, 'utf8')));
    console.log('Fresh production scan: every service is clean');
  } catch (error) {
    console.error(errorMessage(error));
    process.exitCode = 1;
  }
}
