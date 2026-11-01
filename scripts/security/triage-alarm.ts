// cspell:ignore dont Unsandboxed getconf fsmonitor
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REPO_ROOT, SECURITY_REPORT_ROOT, trivyBinary } from '../shared/paths.ts';
import { withPidLock } from '../shared/pid-lock.ts';
import { ensurePrivateDir, writePrivateAtomic } from '../shared/private-fs.ts';
import { errorMessage, isMain, isRecord } from '../shared/runtime.ts';

// Runs headless Claude Code against a failed dependency or image scan and lets
// it open a draft PR (docs/intents/infra/security-alarm-triage.md). Backup,
// offsite and refresh failures need host state, not code, and stay manual.

const MAX_REPORT_AGE_MS = 6 * 3600 * 1000;
const RUN_TIMEOUT_MS = 45 * 60 * 1000;
const REPOSITORY = 'https://github.com/researcherhojin/emelmujiro.git';

export interface TriageState {
  completedAt: string;
  startedAt: string;
  exitCode: number | null;
}

export type Decision = { run: true; failed: string[] } | { run: false; reason: string };

export function decide(
  report: unknown,
  state: TriageState | null,
  now: number,
  maintenanceLocked: boolean
): Decision {
  if (!isRecord(report) || report.version !== 1 || typeof report.completedAt !== 'string')
    return { run: false, reason: 'invalid report' };
  const completed = Date.parse(report.completedAt);
  if (!Number.isFinite(completed)) return { run: false, reason: 'invalid report' };
  const failed = (['dependencies', 'images'] as const).filter((key) => report[key] !== true);
  if (failed.length === 0) return { run: false, reason: 'scans clean' };
  if (now - completed > MAX_REPORT_AGE_MS) return { run: false, reason: 'stale report' };
  if (state?.completedAt === report.completedAt) return { run: false, reason: 'already triaged' };
  if (maintenanceLocked) return { run: false, reason: 'maintenance running' };
  return { run: true, failed };
}

// The agent holds no GitHub credential: it commits locally and writes pr.md,
// and publish() below pushes and opens the draft PR after mechanical checks.
const BASH_ALLOWED = [
  'Bash(npm ci *)',
  'Bash(npm install --package-lock-only *)',
  'Bash(npm audit *)',
  'Bash(npm ls *)',
  'Bash(npm view *)',
  'Bash(npm run *)',
  'Bash(npm test *)',
  'Bash(npx eslint *)',
  'Bash(npx prettier *)',
  'Bash(node scripts/security/*)',
  'Bash(git status*)',
  'Bash(git diff*)',
  'Bash(git log*)',
];

const BASH_DISALLOWED = [
  'Bash(docker *)',
  'Bash(ssh *)',
  'Bash(curl *)',
  'Bash(gh *)',
  'Bash(git push*)',
  'Bash(git remote*)',
  'Bash(git config *)',
  'Bash(npm audit fix*)',
];

export interface RunPaths {
  clone: string;
  run: string;
  promptFile: string;
  settings: string;
}

// Claude Code's absolute-path rule syntax is a leading double slash.
const rule = (tool: string, directory: string) => `${tool}(/${path.resolve(directory)}/**)`;

// File tools reach only the clone and the run directory, never .git. Bash runs
// in the OS sandbox: writes stay in the clone and the package caches, secrets
// and the production report are unreadable, and the network reaches only the
// registries the scans use (no github.com).
export function triageSettings(
  paths: { clone: string; run: string; temp: string },
  repoRoot: string,
  home: string
) {
  const secrets = [
    path.join(home, '.ssh'),
    path.join(home, '.config/emelmujiro-triage'),
    path.join(home, '.config/gh'),
    path.join(home, 'Library/Keychains'),
    path.join(repoRoot, '.env'),
    path.join(repoRoot, '.private'),
    path.join(repoRoot, 'backend/.env'),
    path.join(repoRoot, 'backend/.env.production'),
    path.join(repoRoot, 'backend/logs'),
  ];
  return {
    permissions: {
      // Edit rules also govern the Write tool; Write(path) rules never match.
      allow: [
        rule('Read', paths.clone),
        rule('Edit', paths.clone),
        rule('Read', paths.run),
        rule('Edit', paths.run),
      ],
      deny: [
        // .git stays read-only even to sandboxed node; publish() commits.
        rule('Edit', path.join(paths.clone, '.git')),
        rule('Edit', path.join(paths.run, 'input')),
        ...secrets.map((secret) => rule('Read', secret)),
      ],
    },
    sandbox: {
      enabled: true,
      failIfUnavailable: true,
      allowUnsandboxedCommands: false,
      autoAllowBashIfSandboxed: false,
      filesystem: {
        allowWrite: [
          paths.clone,
          paths.temp,
          path.join(home, '.npm'),
          path.join(home, 'Library/Caches/trivy'),
        ],
        denyRead: secrets,
      },
      // check:scripts starts its webhook tests on 127.0.0.1.
      network: {
        allowedDomains: ['registry.npmjs.org', 'mirror.gcr.io'],
        strictAllowlist: true,
        allowLocalBinding: true,
      },
      credentials: { envVars: [{ name: 'CLAUDE_CODE_OAUTH_TOKEN', mode: 'deny' }] },
    },
  };
}

export function claudeArgs(paths: RunPaths, failed: string[], issue: string): string[] {
  const prompt = fs
    .readFileSync(paths.promptFile, 'utf8')
    .replaceAll('{{FAILED}}', failed.join(', '))
    .replaceAll('{{ISSUE}}', issue)
    .replaceAll('{{INPUT}}', path.join(paths.run, 'input'))
    .replaceAll('{{PR}}', path.join(paths.run, 'pr.md'))
    .replaceAll('{{DIAGNOSIS}}', path.join(paths.run, 'diagnosis.md'));
  return [
    '-p',
    prompt,
    '--permission-mode',
    'dontAsk',
    '--setting-sources',
    'project',
    '--settings',
    paths.settings,
    '--max-turns',
    '120',
    // Every tool call and the final permission_denials list land in claude.log.
    '--output-format',
    'stream-json',
    '--verbose',
    '--add-dir',
    paths.run,
    '--allowedTools',
    'Grep',
    'Glob',
    ...BASH_ALLOWED,
    '--disallowedTools',
    'WebFetch',
    'WebSearch',
    ...BASH_DISALLOWED,
  ];
}

// Only the Claude token and what the tools need; the parent environment and
// the GitHub token stay out.
export function claudeEnv(secrets: string, trivy: string, home = os.homedir()): NodeJS.ProcessEnv {
  return {
    HOME: home,
    USER: os.userInfo().username,
    LANG: 'en_US.UTF-8',
    PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
    HUSKY: '0',
    TRIVY_BIN: trivy,
    // Strips credentials from Bash and hook environments; claude keeps its own.
    CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: '1',
    CLAUDE_CODE_OAUTH_TOKEN: fs.readFileSync(path.join(secrets, 'oauth-token'), 'utf8').trim(),
  };
}

// The scan inputs are copied so the agent can read them without write access
// to the live report directory that /security-report serves.
function copyInput(reportDir: string, input: string): void {
  ensurePrivateDir(input);
  for (const name of fs.readdirSync(reportDir)) {
    if (name.endsWith('.json') || name.endsWith('-scheduled.log'))
      fs.copyFileSync(path.join(reportDir, name), path.join(input, name));
  }
  const dependencies = path.join(reportDir, 'dependencies');
  if (fs.existsSync(dependencies)) {
    ensurePrivateDir(path.join(input, 'dependencies'));
    for (const name of fs.readdirSync(dependencies))
      fs.copyFileSync(path.join(dependencies, name), path.join(input, 'dependencies', name));
  }
}

function git(clone: string, args: string[]): string {
  const result = spawnSync('git', ['-C', clone, ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed`);
  return result.stdout.trim();
}

// A dedicated clone, never the production checkout. Each run starts from
// origin/main with no local triage branches and no stored credential.
function prepareClone(clone: string, hooks: string): void {
  if (path.resolve(clone) === REPO_ROOT) throw new Error('Triage clone must not be the checkout');
  if (!fs.existsSync(path.join(clone, '.git'))) {
    const result = spawnSync('git', ['clone', '--quiet', REPOSITORY, clone]);
    if (result.status !== 0) throw new Error('git clone failed');
  }
  git(clone, ['remote', 'set-url', 'origin', REPOSITORY]);
  git(clone, ['config', 'core.hooksPath', hooks]);
  // The repo's commit identity is the noreply address, not the host's global one.
  git(clone, ['config', 'user.name', 'Hojin Lee']);
  git(clone, ['config', 'user.email', '126234284+researcherhojin@users.noreply.github.com']);
  spawnSync('git', ['-C', clone, 'config', '--unset-all', 'credential.https://github.com.helper']);
  git(clone, ['fetch', '--quiet', '--prune', 'origin']);
  git(clone, ['switch', '--quiet', '--detach', 'origin/main']);
  git(clone, ['reset', '--quiet', '--hard', 'origin/main']);
  git(clone, ['clean', '-fdq']);
  for (const branch of git(clone, [
    'for-each-ref',
    '--format=%(refname:short)',
    'refs/heads/',
  ]).split('\n'))
    if (branch) git(clone, ['branch', '-D', '--quiet', branch]);
}

// The only paths a triage PR may change: what a dependency or image fix needs.
// Everything else, ignore files and the scanner included, is refused.
const PUBLISHABLE = [
  /^(package|package-lock)\.json$/,
  /^(frontend|scripts|frontend\/scripts)\/package\.json$/,
  /^backend\/(pyproject\.toml|uv\.lock|Dockerfile)$/,
  /^docker-compose\.yml$/,
  /^docker\/[a-z]+\/Dockerfile$/,
  /^docker\/umami\/(runner\/)?(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$/,
  /^docker\/umami\/patches\/[^/]+\.patch$/,
  /^CHANGELOG\.md$/,
];

export type Publication = { publish: true; branch: string } | { publish: false; reason: string };

export function checkChanges(changed: string[], head: string, base: string, pr: string | null) {
  if (head !== base) return 'HEAD moved off the recorded base';
  if (changed.length === 0) return 'no changes';
  const refused = changed.filter((file) => !PUBLISHABLE.some((pattern) => pattern.test(file)));
  if (refused.length > 0) return `paths outside the allowlist: ${refused.join(', ')}`;
  if (!pr || !pr.split('\n')[0].trim()) return 'missing pr.md title';
  return null;
}

export function branchName(title: string, now: Date): string {
  const slug = title
    .replace(/^[a-z-]+(\([^)]*\))?!?:\s*/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return `triage/${now.toISOString().slice(0, 10)}-${slug || 'fix'}`;
}

export type Command = (binary: string, args: string[], env: NodeJS.ProcessEnv) => number | null;

const runCommand: Command = (binary, args, env) =>
  spawnSync(binary, args, { env, stdio: 'inherit' }).status;

// Runs outside the agent and its sandbox, which never had write access to
// .git: this step alone branches, commits, pushes and opens the draft PR, with
// the hooks and fsmonitor forced on every git call and the token only here.
export function publish(options: {
  clone: string;
  run: string;
  token: string;
  base: string;
  hooks: string;
  now?: Date;
  remote?: string;
  command?: Command;
}): Publication {
  const { clone, run, token, base, hooks } = options;
  const remote = options.remote ?? REPOSITORY;
  const command = options.command ?? runCommand;
  const forced = ['-C', clone, '-c', `core.hooksPath=${hooks}`, '-c', 'core.fsmonitor=false'];
  const read = (args: string[]) => {
    const result = spawnSync('git', [...forced, ...args], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`git ${args[0]} failed`);
    return result.stdout;
  };
  const changed = read(['status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames'])
    .split('\0')
    .filter(Boolean)
    .map((entry) => entry.slice(3));
  const prFile = path.join(run, 'pr.md');
  const pr = fs.existsSync(prFile) ? fs.readFileSync(prFile, 'utf8') : null;
  const refused = checkChanges(changed, read(['rev-parse', 'HEAD']).trim(), base, pr);
  if (refused || !pr) return { publish: false, reason: refused ?? 'missing pr.md title' };

  const [title, ...body] = pr.split('\n');
  const subject = title.replace(/^#\s*/, '').trim();
  const branch = branchName(subject, options.now ?? new Date());
  const message = path.join(run, 'commit-message.txt');
  fs.writeFileSync(
    message,
    `${subject}\n\n${body.join('\n').trim()}\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n`,
    { mode: 0o600 }
  );
  const env = {
    HOME: os.homedir(),
    PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
    GH_TOKEN: token,
  };
  const steps: [string, string[]][] = [
    ['git', [...forced, 'switch', '--quiet', '-c', branch]],
    ['git', [...forced, 'add', '--', ...changed]],
    ['git', [...forced, 'commit', '--quiet', '-F', message]],
    [
      'git',
      [
        ...forced,
        '-c',
        'credential.helper=',
        '-c',
        'credential.helper=!gh auth git-credential',
        'push',
        remote,
        `refs/heads/${branch}:refs/heads/${branch}`,
      ],
    ],
  ];
  for (const [binary, args] of steps)
    if (command(binary, args, env) !== 0)
      return { publish: false, reason: `${args[forced.length]} failed` };
  const bodyFile = path.join(run, 'pr-body.md');
  fs.writeFileSync(bodyFile, body.join('\n').trim(), { mode: 0o600 });
  const created = command(
    'gh',
    [
      'pr',
      'create',
      '--draft',
      '--repo',
      'researcherhojin/emelmujiro',
      '--base',
      'main',
      '--head',
      branch,
      '--title',
      subject,
      '--body-file',
      bodyFile,
    ],
    env
  );
  if (created !== 0) return { publish: false, reason: 'gh pr create failed' };
  return { publish: true, branch };
}

function alarmIssue(token: string): string {
  const result = spawnSync(
    'gh',
    [
      'issue',
      'list',
      '--repo',
      'researcherhojin/emelmujiro',
      '--state',
      'open',
      '--search',
      'Security operations require attention in:title',
      '--json',
      'number',
      '--jq',
      '.[0].number',
    ],
    {
      encoding: 'utf8',
      env: { HOME: os.homedir(), PATH: '/opt/homebrew/bin:/usr/bin:/bin', GH_TOKEN: token },
    }
  );
  const number = result.status === 0 ? result.stdout.trim() : '';
  return /^\d+$/.test(number) ? `#${number}` : 'none open';
}

// macOS's per-user temp directory; cron sets no TMPDIR, so os.tmpdir() is /tmp.
function userTempDir(): string {
  const result = spawnSync('getconf', ['DARWIN_USER_TEMP_DIR'], { encoding: 'utf8' });
  return result.status === 0 && result.stdout.trim() ? result.stdout.trim() : os.tmpdir();
}

function readState(file: string): TriageState | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as TriageState;
  } catch {
    return null;
  }
}

function main(): void {
  const reportDir = process.env.TRIAGE_REPORT_DIR ?? SECURITY_REPORT_ROOT;
  const triageDir = path.join(SECURITY_REPORT_ROOT, 'triage');
  // Outside the checkout: the agent may not read anything under backend/logs.
  const runs = path.join(os.homedir(), '.local/state/emelmujiro-triage/runs');
  const secrets = path.join(os.homedir(), '.config/emelmujiro-triage');
  const clone = process.env.TRIAGE_CLONE ?? path.join(os.homedir(), 'workspace/emelmujiro-triage');
  const claude = process.env.TRIAGE_CLAUDE ?? path.join(os.homedir(), '.local/bin/claude');
  ensurePrivateDir(triageDir);
  const stateFile = path.join(triageDir, 'state.json');

  withPidLock(
    path.join(triageDir, 'triage.lock'),
    { invalid: 'Invalid triage lock', busy: 'Triage already running' },
    () => {
      const report = JSON.parse(fs.readFileSync(path.join(reportDir, 'operations.json'), 'utf8'));
      const decision = decide(
        report,
        readState(stateFile),
        Date.now(),
        fs.existsSync(path.join(REPO_ROOT, 'backend/logs/maintenance.lock'))
      );
      if (!decision.run) {
        console.log(`Triage skipped: ${decision.reason}`);
        return;
      }
      const state: TriageState = {
        completedAt: report.completedAt,
        startedAt: new Date().toISOString(),
        exitCode: null,
      };
      // Recorded before the run, so a crash never retriggers on the same report.
      writePrivateAtomic(stateFile, `${stateFile}.tmp`, JSON.stringify(state));
      const run = path.join(runs, state.startedAt.replace(/[:.]/g, '-'));
      ensurePrivateDir(run);
      const token = fs.readFileSync(path.join(secrets, 'github-token'), 'utf8').trim();
      try {
        copyInput(reportDir, path.join(run, 'input'));
        prepareClone(clone, path.join(REPO_ROOT, 'scripts/security/triage-hooks'));
      } catch (error) {
        state.exitCode = -1;
        writePrivateAtomic(stateFile, `${stateFile}.tmp`, JSON.stringify(state));
        throw error;
      }
      fs.writeFileSync(
        path.join(run, 'settings.json'),
        JSON.stringify(
          triageSettings({ clone, run, temp: userTempDir() }, REPO_ROOT, os.homedir()),
          null,
          2
        ),
        { mode: 0o600 }
      );
      const hooks = path.join(REPO_ROOT, 'scripts/security/triage-hooks');
      const base = git(clone, ['rev-parse', 'HEAD']);
      const output = fs.openSync(path.join(run, 'claude.log'), 'w', 0o600);
      const result = spawnSync(
        claude,
        claudeArgs(
          {
            clone,
            run,
            promptFile: path.join(REPO_ROOT, 'scripts/security/triage-prompt.md'),
            settings: path.join(run, 'settings.json'),
          },
          decision.failed,
          alarmIssue(token)
        ),
        {
          cwd: clone,
          env: claudeEnv(secrets, trivyBinary()),
          stdio: ['ignore', output, output],
          timeout: RUN_TIMEOUT_MS,
        }
      );
      fs.closeSync(output);
      state.exitCode = result.status;
      writePrivateAtomic(stateFile, `${stateFile}.tmp`, JSON.stringify(state));
      const publication: Publication =
        result.status === 0
          ? publish({ clone, run, token, base, hooks })
          : { publish: false, reason: 'agent failed' };
      fs.writeFileSync(path.join(run, 'publish.json'), JSON.stringify(publication), {
        mode: 0o600,
      });
      console.log(
        `Triage finished: exit ${result.status ?? result.signal}, ` +
          (publication.publish
            ? `draft PR from ${publication.branch}`
            : `no PR (${publication.reason})`)
      );
      if (result.status !== 0) process.exitCode = 1;
    }
  );
}

if (isMain(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Triage failed: ${errorMessage(error)}`);
    process.exitCode = 1;
  }
}
