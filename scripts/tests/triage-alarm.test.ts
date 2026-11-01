// cspell:ignore dont Unsandboxed
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  branchName,
  checkChanges,
  claudeArgs,
  claudeEnv,
  decide,
  publish,
  triageSettings,
} from '../security/triage-alarm.ts';
import { REPO_ROOT } from '../shared/paths.ts';

const reportNow = Date.parse('2026-11-02T00:00:00Z');
const report = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  completedAt: '2026-11-01T20:00:00Z',
  dependencies: false,
  images: true,
  backup: true,
  offsite: true,
  ...overrides,
});
const outcome = (input: unknown, state = null as Parameters<typeof decide>[1], locked = false) => {
  const decision = decide(input, state, reportNow, locked);
  return decision.run ? decision.failed : decision.reason;
};

test('triage runs only for a fresh, not yet triaged dependency or image failure', () => {
  assert.deepEqual(outcome(report()), ['dependencies']);
  assert.deepEqual(outcome(report({ images: false })), ['dependencies', 'images']);
  // A missing or non-boolean result is a failure, as the watchdog treats it.
  assert.deepEqual(outcome(report({ dependencies: 'true' })), ['dependencies']);
  assert.equal(outcome(report({ dependencies: true })), 'scans clean');
  // Backup, offsite and refresh failures stay manual.
  assert.equal(
    outcome(report({ dependencies: true, backup: false, offsite: false })),
    'scans clean'
  );
  for (const input of [{}, null, report({ version: 2 }), report({ completedAt: 'invalid' })])
    assert.equal(outcome(input), 'invalid report');
  assert.deepEqual(outcome(report({ completedAt: '2026-11-01T18:00:00Z' })), ['dependencies']);
  assert.equal(outcome(report({ completedAt: '2026-11-01T17:59:59Z' })), 'stale report');
  const state = { completedAt: '2026-11-01T20:00:00Z', startedAt: '', exitCode: null };
  assert.equal(outcome(report(), state), 'already triaged');
  assert.deepEqual(outcome(report(), { ...state, completedAt: '2026-10-31T20:00:00Z' }), [
    'dependencies',
  ]);
  assert.equal(outcome(report(), null, true), 'maintenance running');
});

test('claude runs without prompts, with generated settings and a Bash allowlist with no GitHub writes', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'triage '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const promptFile = path.join(directory, 'prompt.md');
  fs.writeFileSync(promptFile, '{{FAILED}} {{ISSUE}} {{INPUT}} {{PR}} {{DIAGNOSIS}}');
  const args = claudeArgs(
    { clone: '/clone', run: '/runs/1', promptFile, settings: '/runs/1/settings.json' },
    ['dependencies', 'images'],
    '#713'
  );
  const allowedAt = args.indexOf('--allowedTools');
  const deniedAt = args.indexOf('--disallowedTools');
  assert.deepEqual(args.slice(0, allowedAt), [
    '-p',
    'dependencies, images #713 /runs/1/input /runs/1/pr.md /runs/1/diagnosis.md',
    '--permission-mode',
    'dontAsk',
    '--setting-sources',
    'project',
    '--settings',
    '/runs/1/settings.json',
    '--max-turns',
    '120',
    '--output-format',
    'stream-json',
    '--verbose',
    '--add-dir',
    '/runs/1',
  ]);
  const allowed = args.slice(allowedAt + 1, deniedAt);
  const denied = args.slice(deniedAt + 1);
  // File tools are scoped in the settings, never granted bare here.
  assert.ok(!allowed.some((tool) => /^(Read|Edit|Write|Bash)$/.test(tool)));
  assert.ok(!allowed.some((tool) => /push|gh |docker|ssh|curl|config|remote|audit fix/.test(tool)));
  for (const tool of [
    'Bash(gh *)',
    'Bash(git push*)',
    'Bash(git remote*)',
    'Bash(git config *)',
    'WebFetch',
  ])
    assert.ok(denied.includes(tool), tool);
});

test('settings scope file tools to the clone and run, and sandbox Bash away from secrets and GitHub', () => {
  const settings = triageSettings({ clone: '/c', run: '/r', temp: '/t' }, '/prod', '/home/u');
  assert.deepEqual(settings.permissions.allow, [
    'Read(//c/**)',
    'Edit(//c/**)',
    'Read(//r/**)',
    'Edit(//r/**)',
  ]);
  for (const rule of [
    'Edit(//c/.git/**)',
    'Edit(//r/input/**)',
    'Read(//home/u/.ssh/**)',
    'Read(//home/u/.config/emelmujiro-triage/**)',
    'Read(//prod/backend/.env.production/**)',
  ])
    assert.ok(settings.permissions.deny.includes(rule), rule);
  const { sandbox } = settings;
  assert.equal(sandbox.enabled, true);
  assert.equal(sandbox.failIfUnavailable, true);
  assert.equal(sandbox.allowUnsandboxedCommands, false);
  assert.equal(sandbox.autoAllowBashIfSandboxed, false);
  assert.ok(sandbox.filesystem.denyRead.includes('/home/u/.config/emelmujiro-triage'));
  assert.deepEqual(sandbox.network.allowedDomains, ['registry.npmjs.org', 'mirror.gcr.io']);
  assert.equal(sandbox.network.strictAllowlist, true);
  assert.deepEqual(sandbox.filesystem.allowWrite.slice(0, 2), ['/c', '/t']);
});

test('claude environment carries only the Claude token and tool paths, scrubbed from Bash', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'triage secrets '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(path.join(directory, 'oauth-token'), 'oauth\n');
  fs.writeFileSync(path.join(directory, 'github-token'), 'github\n');
  const env = claudeEnv(directory, '/bin/trivy', '/home/test');
  assert.deepEqual(Object.keys(env).sort(), [
    'CLAUDE_CODE_OAUTH_TOKEN',
    'CLAUDE_CODE_SUBPROCESS_ENV_SCRUB',
    'HOME',
    'HUSKY',
    'LANG',
    'PATH',
    'TRIVY_BIN',
    'USER',
  ]);
  assert.equal(env.CLAUDE_CODE_OAUTH_TOKEN, 'oauth');
  assert.equal(env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB, '1');
});

test('pre-push hook allows only triage branches', () => {
  const hook = path.join(REPO_ROOT, 'scripts/security/triage-hooks/pre-push');
  const push = (ref: string) =>
    spawnSync('sh', [hook], { input: `refs/heads/x abc ${ref} def\n` }).status;
  assert.equal(push('refs/heads/triage/2026-11-02-minimatch'), 0);
  for (const ref of ['refs/heads/main', 'refs/heads/feature/triage/x', 'refs/tags/v1'])
    assert.equal(push(ref), 1, ref);
});

// A local bare remote stands in for GitHub; the PR step is a recording stub.
function triageRepo(t: { after: (fn: () => void) => void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'triage publish '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (cwd: string, ...args: string[]) => {
    const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const remote = path.join(root, 'remote.git');
  const clone = path.join(root, 'clone');
  git(root, 'init', '--quiet', '--bare', '--initial-branch=main', remote);
  git(root, 'clone', '--quiet', remote, clone);
  git(clone, 'config', 'user.name', 'test');
  git(clone, 'config', 'user.email', 'test@example.com');
  for (const file of ['package.json', 'package-lock.json', '.github/workflows/watchdog.yml'])
    write(clone, file, '{}\n');
  git(clone, 'add', '.');
  git(clone, 'commit', '--quiet', '-m', 'init');
  git(clone, 'push', '--quiet', 'origin', 'main');
  git(clone, 'switch', '--quiet', '--detach', 'origin/main');
  const run = path.join(root, 'run');
  fs.mkdirSync(run);
  fs.writeFileSync(path.join(run, 'pr.md'), 'fix(deps): bump follow-redirects to 1.16.2\n\nBody');
  const hooks = path.join(REPO_ROOT, 'scripts/security/triage-hooks');
  return { remote, clone, run, hooks, base: git(clone, 'rev-parse', 'HEAD'), git };
}

function write(root: string, file: string, content: string) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
}

const now = new Date('2026-11-02T03:00:00Z');

test('publish commits the agent changes on a triage branch, pushes it and opens a draft PR', (t) => {
  const repo = triageRepo(t);
  write(repo.clone, 'package-lock.json', '{"v":2}\n');
  write(repo.clone, 'CHANGELOG.md', '- fix\n');
  const calls: { binary: string; args: string[]; env: NodeJS.ProcessEnv }[] = [];
  const result = publish({
    ...repo,
    token: 'token',
    now,
    command: (binary, args, env) => {
      calls.push({ binary, args, env });
      return binary === 'git' ? spawnSync(binary, args, { stdio: 'ignore' }).status : 0;
    },
  });
  const branch = 'triage/2026-11-02-bump-follow-redirects-to-1-16-2';
  assert.deepEqual(result, { publish: true, branch });
  for (const call of calls) {
    assert.equal(call.env.GH_TOKEN, 'token');
    if (call.binary === 'git') assert.ok(call.args.includes(`core.hooksPath=${repo.hooks}`));
  }
  assert.equal(
    repo.git(repo.remote, 'log', '-1', '--format=%s', branch),
    'fix(deps): bump follow-redirects to 1.16.2'
  );
  assert.deepEqual(repo.git(repo.remote, 'diff', '--name-only', `main...${branch}`).split('\n'), [
    'CHANGELOG.md',
    'package-lock.json',
  ]);
  const pr = calls.at(-1)!;
  assert.equal(pr.binary, 'gh');
  assert.deepEqual(pr.args.slice(0, 3), ['pr', 'create', '--draft']);
});

test('publish refuses ignore files, scanner code, renames out of CI, scratch files and a moved HEAD', (t) => {
  const refuse = (change: (repo: ReturnType<typeof triageRepo>) => void, reason: string) => {
    const repo = triageRepo(t);
    change(repo);
    const result = publish({
      ...repo,
      token: 'token',
      now,
      command: () => assert.fail('no command may run'),
    });
    assert.deepEqual(result, { publish: false, reason });
  };
  refuse(
    (r) => write(r.clone, 'docker/umami/trivyignore.yaml', 'x'),
    'paths outside the allowlist: docker/umami/trivyignore.yaml'
  );
  refuse(
    (r) => write(r.clone, 'scripts/security/dependencies.ts', 'x'),
    'paths outside the allowlist: scripts/security/dependencies.ts'
  );
  refuse(
    (r) =>
      fs.renameSync(
        path.join(r.clone, '.github/workflows/watchdog.yml'),
        path.join(r.clone, 'package.json')
      ),
    'paths outside the allowlist: .github/workflows/watchdog.yml'
  );
  refuse((r) => {
    write(r.clone, 'package-lock.json', '{"v":2}\n');
    write(r.clone, 'scripts/security/attack.mjs', 'x');
  }, 'paths outside the allowlist: scripts/security/attack.mjs');
  refuse(() => undefined, 'no changes');
  refuse((r) => {
    write(r.clone, 'package-lock.json', '{"v":2}\n');
    fs.writeFileSync(path.join(r.run, 'pr.md'), '\nbody');
  }, 'missing pr.md title');
  refuse((r) => {
    write(r.clone, 'package-lock.json', '{"v":2}\n');
    r.git(r.clone, 'commit', '--quiet', '-am', 'agent commit');
  }, 'HEAD moved off the recorded base');
});

test('allowlist covers what a dependency or image fix needs', () => {
  for (const file of [
    'package-lock.json',
    'frontend/package.json',
    'backend/uv.lock',
    'backend/Dockerfile',
    'docker-compose.yml',
    'docker/postgres/Dockerfile',
    'docker/umami/runner/pnpm-lock.yaml',
    'docker/umami/patches/deepmerge@4.3.1.patch',
    'CHANGELOG.md',
  ])
    assert.equal(checkChanges([file], 'a', 'a', 'title'), null, file);
  assert.equal(branchName('fix(deps)!: Bump X/Y to 2.0', now), 'triage/2026-11-02-bump-x-y-to-2-0');
});
