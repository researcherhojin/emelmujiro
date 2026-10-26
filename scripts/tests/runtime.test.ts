import type { TestContext } from 'node:test';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isMain } from '../shared/runtime.ts';

function withArgv(t: TestContext, entry: string | undefined): void {
  const original = process.argv[1];
  t.after(() => {
    process.argv[1] = original;
  });
  process.argv[1] = entry as string;
}

test('isMain matches a script reached through a symlinked directory', (t) => {
  const real = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-real-'));
  const link = `${real}-link`;
  fs.symlinkSync(real, link);
  t.after(() => fs.rmSync(link, { force: true }));
  t.after(() => fs.rmSync(real, { recursive: true, force: true }));
  const script = path.join(real, 'entry.ts');
  fs.writeFileSync(script, '');

  withArgv(t, path.join(link, 'entry.ts'));
  // Node resolves symlinks for import.meta.url, so the module sees the real path.
  assert.equal(isMain(pathToFileURL(fs.realpathSync(script)).href), true);
});

test('isMain is false for another module or no entry script', (t) => {
  withArgv(t, fs.realpathSync(import.meta.filename));
  assert.equal(isMain(pathToFileURL(path.join(os.tmpdir(), 'other.ts')).href), false);
  withArgv(t, undefined);
  assert.equal(isMain(import.meta.url), false);
});
