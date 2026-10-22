import { execFileSync } from 'node:child_process';
import { isMain, isRecord } from './security-runtime.ts';
export const TITLE = 'Security monitoring requires attention';
export const MARKER = '<!-- automated-security-monitor -->';

export function reconcile({
  run,
  repository,
  runUrl,
  dependencies,
  production,
}: {
  run: (args: string[], input?: string) => string;
  repository: string;
  runUrl: string;
  dependencies: string;
  production: string;
}) {
  const issues = JSON.parse(
    run([
      'issue',
      'list',
      '--repo',
      repository,
      '--state',
      'open',
      '--search',
      `"${TITLE}" in:title`,
      '--json',
      'number,title,body',
      '--limit',
      '100',
    ])
  );
  if (!Array.isArray(issues)) throw new Error('Invalid issue list');
  const existing = issues.find(
    (issue: unknown) =>
      isRecord(issue) &&
      issue.title === TITLE &&
      typeof issue.body === 'string' &&
      issue.body.includes(MARKER)
  );
  const healthy = dependencies === 'success' && production === 'success';
  if (healthy) {
    if (existing)
      run([
        'issue',
        'close',
        String(existing.number),
        '--repo',
        repository,
        '--comment',
        `Both security checks recovered. Run: ${runUrl}`,
      ]);
    return;
  }
  // Only statuses and a run link leave the scanner; no host details or CVE
  // inventories are copied into a public issue.
  const body =
    `${MARKER}\nDependency audit: ${dependencies}\nProduction scan check: ${production}\n\n` +
    `Review the run for vulnerabilities, scanner errors or missing/stale results.\n\nRun: ${runUrl}`;
  if (existing) {
    run(
      ['issue', 'comment', String(existing.number), '--repo', repository, '--body-file', '-'],
      body
    );
  } else {
    run(['issue', 'create', '--repo', repository, '--title', TITLE, '--body-file', '-'], body);
  }
}

if (isMain(import.meta.url)) {
  reconcile({
    run: (args, input) => execFileSync('gh', args, { input, encoding: 'utf8', timeout: 30000 }),
    repository: process.env.GH_REPO || '',
    runUrl: process.env.RUN_URL || '',
    dependencies: process.env.DEPENDENCIES_RESULT || '',
    production: process.env.PRODUCTION_RESULT || '',
  });
}
