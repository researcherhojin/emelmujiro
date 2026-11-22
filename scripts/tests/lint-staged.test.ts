import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import lintStaged from 'lint-staged';

test('lint-staged passes complete frontend and backend paths to each tool', async (t) => {
  const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'staged files ')));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], { cwd: directory });
  git('init', '--quiet');
  fs.copyFileSync(
    new URL('../../.lintstagedrc.mts', import.meta.url),
    path.join(directory, '.lintstagedrc.mts')
  );

  const bin = path.join(directory, 'node_modules/.bin');
  fs.mkdirSync(bin, { recursive: true });
  for (const tool of ['npm', 'prettier', 'uv']) {
    fs.writeFileSync(
      path.join(bin, tool),
      '#!/bin/sh\nprintf "%s\\n" "${0##*/}" "$@" >> invocations.txt\n',
      { mode: 0o700 }
    );
  }

  const frontend = 'frontend/src/file with spaces.ts';
  const backend = 'backend/api/file with spaces.py';
  for (const file of [frontend, backend]) {
    const target = path.join(directory, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, '');
  }
  git('add', '--', frontend, backend);

  assert.equal(
    await lintStaged({ cwd: directory, concurrent: false, quiet: true, stash: false }),
    true
  );
  const invocations = fs.readFileSync(path.join(directory, 'invocations.txt'), 'utf8').split('\n');
  const frontendPath = path.join(directory, frontend);
  const backendPath = path.join(directory, backend);
  const expected = [
    [
      'npm',
      'exec',
      '--workspace',
      'frontend',
      '--',
      'eslint',
      '--fix',
      '--max-warnings=0',
      frontendPath,
    ],
    ['prettier', '--write', frontendPath],
    ['uv', 'run', '--directory', 'backend', 'black', backendPath],
    ['uv', 'run', '--directory', 'backend', 'flake8', backendPath],
  ];
  for (const args of expected) {
    assert.ok(
      invocations.some((_, i) => args.every((arg, j) => invocations[i + j] === arg)),
      args.join(' ')
    );
  }
});
