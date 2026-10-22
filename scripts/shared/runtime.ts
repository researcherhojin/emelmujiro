import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export type Command = (binary: string, args: string[]) => string;
export function isMain(url: string): boolean {
  return Boolean(process.argv[1] && url === pathToFileURL(process.argv[1]).href);
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
