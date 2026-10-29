import fs from 'node:fs';

// Reports, logs and locks under backend/logs/security are owner-only: they hold
// package inventories, host details and backup metadata.
export function ensurePrivateDir(directory: string): void {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
}

export function writePrivate(file: string, data: string): void {
  fs.writeFileSync(file, data, { mode: 0o600 });
}

// Readers never see a half-written file: write beside the target, then rename.
export function writePrivateAtomic(file: string, temporary: string, data: string): void {
  writePrivate(temporary, data);
  fs.renameSync(temporary, file);
}
