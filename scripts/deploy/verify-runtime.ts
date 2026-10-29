import { verifyRuntime } from '../maintenance/health.ts';
import { command } from '../shared/runtime.ts';
verifyRuntime({ run: command, sha: process.argv[2] });
console.log('Runtime health and deployed commit verified');
