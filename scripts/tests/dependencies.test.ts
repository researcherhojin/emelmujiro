import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LOCK_TARGETS, scanDependencies } from '../security/dependencies.ts';

for (const failure of ['none', 'npm', 'trivy', 'empty', 'missing']) {
  test(`dependency audit handles ${failure} with paths containing spaces`, (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit fixture '));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    for (const [target] of LOCK_TARGETS) {
      fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
      fs.writeFileSync(path.join(root, target), 'fixture');
    }
    if (failure === 'missing') fs.unlinkSync(path.join(root, 'backend/uv.lock'));
    const visited: string[] = [];
    const clean = scanDependencies({
      root,
      directory: path.join(root, 'reports'),
      trivy: '/a path/trivy',
      run(binary, args, cwd) {
        assert.equal(cwd, root);
        visited.push(binary);
        if (binary === 'npm')
          return {
            status: failure === 'npm' ? 1 : 0,
            stdout: JSON.stringify({
              metadata: { vulnerabilities: { total: failure === 'npm' ? 1 : 0 } },
            }),
            stderr: '',
          };
        const target = args.at(-1)!;
        assert.ok(path.isAbsolute(target));
        assert.ok(target.startsWith(root));
        const type = LOCK_TARGETS.find(([file]) => path.join(root, file) === target)![1];
        if (failure === 'trivy') throw new Error('Scanner unavailable');
        return {
          status: 0,
          stderr: '',
          stdout: JSON.stringify({
            SchemaVersion: 2,
            Results:
              failure === 'empty'
                ? []
                : [
                    {
                      Target: target,
                      Class: 'lang-pkgs',
                      Type: type,
                      Packages: [{ Name: 'fixture', Version: '1' }],
                    },
                  ],
          }),
        };
      },
    });
    assert.equal(clean, failure === 'none');
    assert.equal(visited.length, failure === 'missing' ? 4 : 5);
  });
}
