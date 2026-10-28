import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyRuntime } from '../maintenance/health.ts';
const sha = 'a'.repeat(40);
test('readiness retries asynchronous nginx reload without repeating the reload', () => {
  let proxy = 0,
    reload = 0,
    waits = 0;
  verifyRuntime({
    sha,
    reload: true,
    wait: () => waits++,
    run: (bin, args) => {
      if (bin === 'docker' && args.includes('reload')) reload++;
      if (args.at(-1)?.endsWith('/api/health/'))
        return JSON.stringify({ status: 'healthy', commit: sha });
      if (args.includes('%{http_code}')) return ++proxy < 3 ? '502' : '405';
      return '';
    },
  });
  assert.equal(reload, 1);
  assert.equal(waits, 2);
  assert.equal(proxy, 3);
});
test('readiness never accepts an unknown/stale commit or failed proxy', () => {
  for (const commit of ['unknown', 'b'.repeat(40)]) {
    assert.throws(() =>
      verifyRuntime({
        sha,
        attempts: 2,
        wait: () => {},
        run: () => JSON.stringify({ status: 'healthy', commit }),
      })
    );
  }
  assert.throws(() =>
    verifyRuntime({
      sha,
      attempts: 2,
      wait: () => {},
      run: (_bin, args) =>
        args.at(-1)?.endsWith('/api/health/')
          ? JSON.stringify({ status: 'healthy', commit: sha })
          : '502',
    })
  );
});
