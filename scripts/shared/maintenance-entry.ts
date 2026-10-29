import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { SCRIPTS_ROOT } from './paths.ts';

type Spawn = (binary: string, args: string[]) => { status: number | null };
const inherit: Spawn = (binary, args) => spawnSync(binary, args, { stdio: 'inherit' });

// A scheduled entry first re-executes itself under maintenance.ts, which holds
// the shared maintenance lock and sets MAINTENANCE_TOKEN; inside, it confirms
// that it still owns that lock before touching anything.
export function enterMaintenance(
  operation: string,
  {
    env = process.env,
    spawn = inherit,
    exit = (code: number): never => process.exit(code),
  }: { env?: NodeJS.ProcessEnv; spawn?: Spawn; exit?: (code: number) => never } = {}
): void {
  const maintenance = path.join(SCRIPTS_ROOT, 'maintenance/maintenance.ts');
  if (!env.MAINTENANCE_TOKEN) exit(spawn(process.execPath, [maintenance, operation]).status ?? 1);
  if (spawn(process.execPath, [maintenance, 'check']).status !== 0) exit(1);
}
