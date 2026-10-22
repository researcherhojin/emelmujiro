import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { createWebhookServer } from './deploy/server.ts';
import { SCRIPTS_ROOT } from './shared/paths.ts';

const secret = process.env.DEPLOY_SECRET;
if (!secret) {
  console.error('ERROR: DEPLOY_SECRET environment variable is required');
  process.exit(1);
}
const { server, shutdown } = createWebhookServer({
  secret,
  script: path.join(SCRIPTS_ROOT, 'auto-deploy.sh'),
  lockFile: '/tmp/emelmujiro-deploy.lock',
});
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    shutdown();
    process.exit(0);
  });
}
server.listen(parseInt(process.env.DEPLOY_PORT || '9000', 10), '127.0.0.1', () => {
  console.log(`Deploy webhook listening on 127.0.0.1:${(server.address() as AddressInfo).port}`);
});
