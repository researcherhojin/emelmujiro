import path from 'node:path';
import { scanDependencies } from './dependencies.ts';
import { REPO_ROOT, SECURITY_REPORT_ROOT, trivyBinary } from '../shared/paths.ts';

const clean = scanDependencies({
  root: REPO_ROOT,
  directory: path.join(SECURITY_REPORT_ROOT, 'dependencies'),
  trivy: trivyBinary(),
});
if (!clean) process.exitCode = 1;
