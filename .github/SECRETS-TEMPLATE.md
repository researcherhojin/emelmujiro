# GitHub Actions Secrets Template

This file documents all the secrets that need to be configured in your GitHub repository.
Go to **Settings > Secrets and variables > Actions** to add these secrets.

## Required Secrets

### Docker Hub (for container registry)

- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token

### Database

- `DATABASE_URL`: PostgreSQL connection string for production
  - Example: `postgresql://user:password@host:5432/dbname`

### Django

- `SECRET_KEY`: Django secret key for production (generate a secure random string)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

### API Keys

- `REACT_APP_API_URL`: Backend API URL for frontend
  - Example: `https://api.emelmujiro.com`

## Optional Secrets

### AWS (if deploying to AWS)

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `AWS_S3_BUCKET`: S3 bucket name for static files

### Monitoring & Analytics

- `SENTRY_DSN`: Sentry error tracking DSN
- `GA_TRACKING_ID`: Google Analytics tracking ID

### Notifications

- `SLACK_WEBHOOK_URL`: Slack webhook for deployment notifications
- `DISCORD_WEBHOOK_URL`: Discord webhook for notifications

### Code Quality

- `CODECOV_TOKEN`: Codecov token for coverage reports
- `SNYK_TOKEN`: Snyk token for vulnerability scanning
- `SONAR_TOKEN`: SonarCloud token for code quality

### Performance Testing

- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub App token

## Environment-Specific Variables

These can be set as repository variables or environment-specific secrets.

### Staging Environment

- `STAGING_URL`: `https://staging.emelmujiro.com`
- `STAGING_DATABASE_URL`: PostgreSQL connection for staging
- `STAGING_API_URL`: `https://api-staging.emelmujiro.com`

### Production Environment

- `PRODUCTION_URL`: `https://emelmujiro.com`
- `PRODUCTION_DATABASE_URL`: PostgreSQL connection for production
- `PRODUCTION_API_URL`: `https://api.emelmujiro.com`

## How to Generate Secrets

### Django Secret Key

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### Docker Access Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Give it a descriptive name
4. Copy the token (you won't see it again)

### AWS Access Keys

1. Go to AWS IAM Console
2. Create a new user or use existing
3. Attach necessary policies (S3, ECS, etc.)
4. Generate access keys

## Security Best Practices

1. Use GitHub's encrypted secrets
2. Rotate secrets regularly
3. Use least privilege principle for API keys
4. Never commit secrets to the repository
5. Use environment-specific secrets
6. Enable secret scanning in repository settings
7. Use GitHub Environments for production deployments
8. Require reviews for production deployments
