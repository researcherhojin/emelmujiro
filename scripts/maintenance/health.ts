import type { Command } from '../shared/runtime.ts';

export function verifyRuntime({
  run,
  sha,
  reload = false,
  attempts = 12,
  wait = () => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000),
}: {
  run: Command;
  sha: string;
  reload?: boolean;
  attempts?: number;
  wait?: () => unknown;
}): void {
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid expected commit');
  if (reload) {
    run('docker', ['exec', 'emelmujiro-frontend', 'nginx', '-t']);
    run('docker', ['exec', 'emelmujiro-frontend', 'nginx', '-s', 'reload']);
  }
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const backend = JSON.parse(
        run('curl', ['-fsS', '--max-time', '10', 'http://127.0.0.1:8000/api/health/'])
      );
      if (backend.status !== 'healthy' || backend.commit !== sha)
        throw new Error('Backend commit mismatch');
      run('curl', ['-fsS', '--max-time', '10', 'http://127.0.0.1:3001/api/heartbeat']);
      run('docker', ['exec', 'emelmujiro-umami-db', 'pg_isready', '-U', 'umami', '-d', 'umami']);
      run('curl', ['-fsS', '--max-time', '10', 'http://127.0.0.1:8080/']);
      const code = run('curl', [
        '-sS',
        '--max-time',
        '10',
        '-o',
        '/dev/null',
        '-w',
        '%{http_code}',
        'http://127.0.0.1:8080/umami/api/send',
      ]).trim();
      if (!/^4\d\d$/.test(code)) throw new Error('Analytics proxy is not reaching Umami');
      return;
    } catch (error) {
      if (attempt === attempts - 1) throw error;
      wait();
    }
  }
  throw new Error('No readiness attempts configured');
}
