import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Do not steal locks by age or PID: an orphaned child may still be mutating Docker.
// After an unclean exit, an operator must inspect processes before removing the lock.
export function acquireLock(file: string, operation: string): () => void {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const owner = JSON.stringify({ pid: process.pid, token: crypto.randomUUID(), operation });
  fs.writeFileSync(file, owner, { flag: 'wx', mode: 0o600 });
  return () => {
    if (fs.readFileSync(file, 'utf8') !== owner) throw new Error('Maintenance lock owner changed');
    fs.unlinkSync(file);
  };
}
