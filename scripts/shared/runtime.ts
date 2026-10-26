import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export type Command = (binary: string, args: string[]) => string;
// Node resolves symlinks for import.meta.url but not for argv[1], so a script
// started through a symlinked directory (macOS os.tmpdir() is /var -> /private/var)
// would never see itself as main without the realpath.
export function isMain(url: string): boolean {
  if (!process.argv[1]) return false;
  try {
    return url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
export const command: Command = (binary, args) =>
  execFileSync(binary, args, {
    encoding: 'utf8',
    timeout: 12 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
