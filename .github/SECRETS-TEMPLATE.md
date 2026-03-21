# GitHub Actions Secrets Template

This file documents all the secrets used in CI/CD workflows.
Go to **Settings > Secrets and variables > Actions** to add these secrets.

## Required Secrets

### Codecov (coverage reporting)

- `CODECOV_TOKEN`: Codecov upload token for coverage reports
  - Get from: https://app.codecov.io/gh/researcherhojin/emelmujiro/settings
  - Used in: `main-ci-cd.yml` (frontend + backend coverage upload)

### Mac Mini Auto-Deploy

- `MAC_MINI_DEPLOY_SECRET`: Shared secret for deploy webhook authentication
  - Used in: `main-ci-cd.yml` (triggers `scripts/deploy-webhook.js` on Mac Mini)
  - Must match the `DEPLOY_SECRET` env var on the Mac Mini server
  - Generate: `openssl rand -hex 32`

## Automatically Provided

These secrets are provided by GitHub and do not need manual configuration:

- `GITHUB_TOKEN`: Automatic — used for PR comments, dependabot auto-merge, and API calls

## How to Generate Secrets

### Deploy Secret

```bash
openssl rand -hex 32
```

### Django Secret Key (for backend .env, not GitHub secrets)

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```
