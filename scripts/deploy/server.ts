import http from 'node:http';
import type { IncomingMessage } from 'node:http';
import crypto from 'node:crypto';
import path from 'node:path';
import { readOperations } from '../security/operations.ts';
import { SECURITY_REPORT_ROOT } from '../shared/paths.ts';
import { createDeploymentManager } from './manager.ts';
import { isRecord } from '../shared/runtime.ts';

const MAX_BODY_BYTES = 4096;
function timestamp(): string {
  return new Date().toISOString();
}

export function createWebhookServer({
  secret,
  script,
  lockFile,
  operationsFile = path.join(SECURITY_REPORT_ROOT, 'operations.json'),
}: {
  secret: string;
  script: string;
  lockFile: string;
  operationsFile?: string;
}) {
  if (!secret) throw new Error('DEPLOY_SECRET environment variable is required');
  const manager = createDeploymentManager({ script, lockFile });
  function isAuthorized(req: IncomingMessage): boolean {
    const header = req.headers['x-deploy-secret'];
    if (typeof header !== 'string') return false;
    const token = Buffer.from(header);
    const expected = Buffer.from(secret);
    return token.length === expected.length && crypto.timingSafeEqual(token, expected);
  }

  const server = http.createServer((req, res) => {
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', deploying: manager.isDeploying() }));
      return;
    }

    // Only a bounded allow-list of statuses leaves the host, behind the
    // existing deployment secret. Raw scanner output and backups stay private.
    if (req.method === 'GET' && req.url === '/security-report') {
      res.setHeader('Cache-Control', 'no-store');
      if (!isAuthorized(req)) {
        res.writeHead(401);
        res.end();
        return;
      }
      try {
        const report = readOperations(operationsFile);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report));
      } catch {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Security operations report unavailable' }));
      }
      return;
    }

    // Deploy endpoint
    if (req.method === 'POST' && req.url === '/deploy') {
      if (!isAuthorized(req)) {
        console.log(
          `[${timestamp()}] Unauthorized deploy attempt from ${req.socket.remoteAddress}`
        );
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      // Read the body only after authenticating, so an unauthenticated caller
      // never gets to buffer anything. main-ci-cd.yml sends {"sha": github.sha} —
      // the commit the pipeline actually tested. auto-deploy.sh checks that exact
      // commit out instead of racing main's HEAD.
      let body = '';
      let rejected = false;
      req.on('data', (chunk) => {
        if (rejected) return;
        body += chunk;
        if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
          rejected = true;
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Body too large' }));
          req.destroy();
        }
      });
      req.on('end', () => {
        if (rejected) return;
        let sha = '';
        try {
          const parsed: unknown = body.trim() ? JSON.parse(body) : {};
          if (isRecord(parsed) && typeof parsed.sha === 'string') sha = parsed.sha.trim();
        } catch (_) {
          // No body, or not JSON — treat as an older caller and fall back to
          // origin/main inside auto-deploy.sh.
        }
        // This value is exported into a shell script, so accept only a full
        // 40-character hex object name and nothing else.
        if (sha && !/^[0-9a-f]{40}$/.test(sha)) {
          console.log(`[${timestamp()}] Rejecting deploy: malformed sha in payload`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid sha' }));
          return;
        }
        if (
          !manager.startDeploy(sha, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'deploy started', sha: sha || null }));
          })
        ) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Deploy already in progress' }));
        }
      });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return { server, shutdown: manager.shutdown };
}
