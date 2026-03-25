/**
 * Deploy Webhook Server
 *
 * Lightweight HTTP server that listens for deploy requests from GitHub Actions.
 * Validates the request with a shared secret, then runs auto-deploy.sh.
 *
 * Usage:
 *   DEPLOY_SECRET=your-secret node scripts/deploy-webhook.js
 *
 * Environment:
 *   DEPLOY_SECRET  — Required. Shared secret for authentication.
 *   DEPLOY_PORT    — Optional. Default: 9000.
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const { execFile } = require('child_process');
const path = require('path');

const PORT = parseInt(process.env.DEPLOY_PORT || '9000', 10);
const SECRET = process.env.DEPLOY_SECRET;
const DEPLOY_SCRIPT = path.join(__dirname, 'auto-deploy.sh');

if (!SECRET) {
  console.error('ERROR: DEPLOY_SECRET environment variable is required');
  process.exit(1);
}

const LOCK_FILE = '/tmp/emelmujiro-deploy.lock';
const LOCK_MAX_AGE_MS = 15 * 60 * 1000;

function isDeploying() {
  if (!fs.existsSync(LOCK_FILE)) return false;
  const stat = fs.statSync(LOCK_FILE);
  const age = Date.now() - stat.mtimeMs;
  if (age > LOCK_MAX_AGE_MS) {
    console.log(`[${timestamp()}] Removing stale lock file (age: ${Math.round(age / 1000)}s)`);
    fs.unlinkSync(LOCK_FILE);
    return false;
  }
  return true;
}

function acquireLock() {
  fs.writeFileSync(LOCK_FILE, String(process.pid));
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch (_) { /* ignore */ }
}

const server = http.createServer((req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deploying: isDeploying() }));
    return;
  }

  // Deploy endpoint
  if (req.method === 'POST' && req.url === '/deploy') {
    const token = req.headers['x-deploy-secret'];

    const tokenBuf = Buffer.from(token || '');
    const secretBuf = Buffer.from(SECRET);
    if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
      console.log(`[${timestamp()}] Unauthorized deploy attempt from ${req.socket.remoteAddress}`);
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    if (isDeploying()) {
      console.log(`[${timestamp()}] Deploy already in progress, skipping`);
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Deploy already in progress' }));
      return;
    }

    acquireLock();
    console.log(`[${timestamp()}] Deploy triggered`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'deploy started' }));

    execFile('bash', [DEPLOY_SCRIPT], { timeout: 600000 }, (error, stdout, stderr) => {
      releaseLock();
      if (error) {
        console.error(`[${timestamp()}] Deploy failed:`, error.message);
        if (stderr) console.error(stderr);
      } else {
        console.log(`[${timestamp()}] Deploy completed successfully`);
      }
      if (stdout) console.log(stdout);
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[${timestamp()}] Deploy webhook listening on 127.0.0.1:${PORT}`);
});

function timestamp() {
  return new Date().toISOString();
}
