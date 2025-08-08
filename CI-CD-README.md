# CI/CD Pipeline Documentation

## Overview

This project uses a comprehensive CI/CD pipeline with GitHub Actions as the primary platform, with additional support for GitLab CI and Jenkins.

## Pipeline Structure

### 1. **Main CI/CD Pipeline** (`main-ci-cd.yml`)

The primary workflow that handles all aspects of continuous integration and deployment.

#### Triggers:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch
- Scheduled security scans (daily at 2 AM UTC)

#### Jobs:

1. **Code Quality Checks**: Linting for frontend (ESLint) and backend (Black, Flake8)
2. **Security Scanning**: Vulnerability scanning with Trivy, npm audit, and pip-audit
3. **Frontend Testing**: Multi-version Node.js testing with coverage reports
4. **Backend Testing**: Django tests with PostgreSQL integration
5. **E2E Testing**: Playwright tests for critical user flows
6. **Performance Testing**: Lighthouse CI for web performance metrics
7. **Docker Build**: Multi-stage Docker image builds with caching
8. **Deployment**:
   - Staging: Automatic deployment on `develop` branch
   - Production: Automatic deployment on `main` branch to GitHub Pages

### 2. **Pull Request Checks** (`pr-checks.yml`)

Lightweight checks for pull requests to provide quick feedback.

#### Features:

- Quick validation (merge conflicts, commit messages, file sizes)
- Linting and formatting checks
- Affected code testing (only tests changed code)
- Security scanning for dependencies
- Bundle size analysis
- Automated PR comments with results summary

## Environment Configuration

### Required Secrets

Configure these in GitHub Settings > Secrets and variables > Actions:

```yaml
# Docker Registry
DOCKER_USERNAME: Your Docker Hub username
DOCKER_PASSWORD: Your Docker Hub password

# Database (Production)
DATABASE_URL: postgresql://user:pass@host:5432/dbname

# Django
SECRET_KEY: Generated secure key
ALLOWED_HOSTS: Comma-separated list

# Optional Services
SENTRY_DSN: Error tracking
CODECOV_TOKEN: Coverage reports
SNYK_TOKEN: Security scanning
LHCI_GITHUB_APP_TOKEN: Lighthouse CI
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your values
```

## Docker Setup

### Building Images

Use the provided build script:

```bash
# Build locally
./scripts/docker-build.sh

# Build and push to registry
./scripts/docker-build.sh --push --tag v1.0.0

# Build without cache
./scripts/docker-build.sh --no-cache
```

### Running with Docker Compose

```bash
# Development environment
docker-compose up -d

# Production environment with SSL
docker-compose --profile production up -d

# With specific tag
TAG=v1.0.0 docker-compose up -d
```

## Deployment Strategies

### 1. GitHub Pages (Frontend)

- Automatic deployment on push to `main`
- Static site hosting
- Custom domain support

### 2. Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f deploy/kubernetes/

# Check deployment status
kubectl get pods -n emelmujiro
```

### 3. AWS Deployment (Terraform)

```bash
cd deploy/terraform
terraform init
terraform plan
terraform apply
```

### 4. Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml emelmujiro
```

## Alternative CI/CD Platforms

### GitLab CI

If using GitLab, the `.gitlab-ci.yml` file provides equivalent functionality:

- Multi-stage pipeline
- Security scanning
- Container registry integration
- GitLab Pages deployment

### Jenkins

The `Jenkinsfile` provides Jenkins pipeline configuration:

- Parallel execution
- Blue-green deployment support
- Slack notifications
- Manual approval gates

## Monitoring & Observability

### Health Checks

All services include health check endpoints:

- Frontend: `GET /`
- Backend: `GET /api/health/`
- Database: PostgreSQL connection check
- Cache: Redis PING command

### Metrics

- Build time metrics in GitHub Actions
- Coverage reports uploaded to Codecov
- Performance metrics via Lighthouse CI
- Container metrics via Docker stats

## Security

### Automated Security Scanning

1. **Dependency Scanning**: Daily automated updates via Dependabot
2. **Container Scanning**: Trivy scans on every build
3. **Code Scanning**: SAST analysis in CI pipeline
4. **Secret Detection**: Prevents committing secrets

### Security Best Practices

- All secrets stored in GitHub Secrets
- Environment-specific configurations
- SSL/TLS encryption for production
- Regular dependency updates
- Security headers configured

## Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Clear Docker cache
   docker system prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

2. **Test Failures**

   ```bash
   # Run tests locally
   cd frontend && npm test
   cd backend && python manage.py test
   ```

3. **Deployment Issues**
   - Check GitHub Actions logs
   - Verify secrets are configured
   - Ensure branch protection rules allow deployment

## Maintenance

### Regular Tasks

- Review and merge Dependabot PRs weekly
- Check security alerts monthly
- Update base Docker images quarterly
- Review and optimize pipeline performance

### Pipeline Optimization

- Use caching aggressively
- Parallelize independent jobs
- Use matrix builds for multiple versions
- Implement incremental builds

## Contributing

### Adding New CI/CD Features

1. Test changes in a feature branch
2. Update this documentation
3. Ensure backwards compatibility
4. Add appropriate secrets to template

### Workflow Development

```bash
# Validate workflow syntax
actionlint .github/workflows/*.yml

# Test locally with act
act -j test
```

## Support

For CI/CD issues:

1. Check GitHub Actions status page
2. Review workflow logs
3. Verify secret configuration
4. Check branch protection settings

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com)
- [Kubernetes Documentation](https://kubernetes.io/docs)
- [Terraform Documentation](https://www.terraform.io/docs)
