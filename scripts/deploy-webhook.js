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
const { execFile } = require('child_process');
const path = require('path');

const PORT = parseInt(process.env.DEPLOY_PORT || '9000', 10);
const SECRET = process.env.DEPLOY_SECRET;
const DEPLOY_SCRIPT = path.join(__dirname, 'auto-deploy.sh');

if (!SECRET) {
  console.error('ERROR: DEPLOY_SECRET environment variable is required');
  process.exit(1);
}

let deploying = false;

const server = http.createServer((req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deploying }));
    return;
  }

  // Deploy endpoint
  if (req.method === 'POST' && req.url === '/deploy') {
    const token = req.headers['x-deploy-secret'];

    if (!token || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(SECRET))) {
      console.log(`[${timestamp()}] Unauthorized deploy attempt from ${req.socket.remoteAddress}`);
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    if (deploying) {
      console.log(`[${timestamp()}] Deploy already in progress, skipping`);
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Deploy already in progress' }));
      return;
    }

    deploying = true;
    console.log(`[${timestamp()}] Deploy triggered`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'deploy started' }));

    execFile('bash', [DEPLOY_SCRIPT], { timeout: 600000 }, (error, stdout, stderr) => {
      deploying = false;
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
