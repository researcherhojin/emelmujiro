import fs from 'node:fs';
import { isRecord } from './runtime.ts';

export interface PidLockMessages {
  invalid: string;
  busy: string;
}

// A lock whose owner PID is gone is taken over. Unlike maintenance/lock.ts,
// these guard read-only scans and report writes, which leave nothing running.
export function withPidLock<T>(file: string, messages: PidLockMessages, run: () => T): T {
  const take = () => fs.writeFileSync(file, String(process.pid), { flag: 'wx', mode: 0o600 });
  try {
    take();
  } catch (error) {
    if (!isRecord(error) || error.code !== 'EEXIST') throw error;
    const pid = Number(fs.readFileSync(file, 'utf8'));
    if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error(messages.invalid);
    try {
      process.kill(pid, 0);
      throw new Error(messages.busy);
    } catch (probe) {
      if (!isRecord(probe) || probe.code !== 'ESRCH') throw probe;
    }
    fs.unlinkSync(file);
    take();
  }
  try {
    return run();
  } finally {
    fs.unlinkSync(file);
  }
}
