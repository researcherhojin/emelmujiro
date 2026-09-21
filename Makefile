.PHONY: help install setup-dev-machine verify-setup dev dev-local dev-clean dev-docker ports kill-ports build test test-ci lint lint-fix clean deploy logs logs-security logs-debug ps down restart migrate shell createsuperuser update-test-counts cleanup-visits setup-cron remove-cron

help:
	@echo "Available commands:"
	@echo "  make setup-dev-machine - One-shot bootstrap on a fresh macOS dev machine"
	@echo "  make verify-setup      - Run all setup verification checks"
	@echo "  make install           - Install all dependencies (npm + uv)"
	@echo "  make dev               - Start development servers (Docker)"
	@echo "  make dev-local         - Start local development servers"
	@echo "  make dev-clean         - Kill ports and start dev servers"
	@echo "  make build             - Build production images"
	@echo "  make test              - Run all tests"
	@echo "  make test-ci           - Run all tests (CI mode, no watch)"
	@echo "  make lint              - Run linters"
	@echo "  make lint-fix          - Auto-fix lint issues"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make ports             - Check port status"
	@echo "  make kill-ports        - Kill all dev ports"

setup-dev-machine:
	./scripts/setup-dev-machine.sh

# verify-setup: standalone setup health check. Used by setup-dev-machine.sh
# Phase 9 AND can be run independently after manual setup or as a sanity
# check on an existing machine. Each step echoes ✓/✗ — exits non-zero on
# any failure.
#
# NOTE: production .env files (backend/.env.production, frontend/.env.production)
# are intentionally NOT checked here. They only exist on Mac mini (the
# auto-deploy source) and in CI secrets — by design they never reach a
# dev-only machine like a MacBook. See setup-dev-machine.sh header for
# the least-privilege rationale.
verify-setup:
	@echo "═══ verify-setup ═══"
	@command -v node >/dev/null 2>&1 && echo "✓ node $$(node --version)" || (echo "✗ node not on PATH"; exit 1)
	@command -v uv >/dev/null 2>&1 && echo "✓ uv $$(uv --version | awk '{print $$2}')" || (echo "✗ uv not installed"; exit 1)
	@command -v gh >/dev/null 2>&1 && echo "✓ gh $$(gh --version | head -1 | awk '{print $$3}')" || (echo "✗ gh not installed"; exit 1)
	@test -f .env && echo "✓ .env present" || (echo "✗ .env missing"; exit 1)
	@test -f backend/.env && echo "✓ backend/.env present" || (echo "✗ backend/.env missing"; exit 1)
	@test -d frontend/node_modules && echo "✓ frontend/node_modules installed" || (echo "✗ frontend/node_modules missing — run 'make install'"; exit 1)
	@test -d backend/.venv && echo "✓ backend/.venv installed" || (echo "✗ backend/.venv missing — run 'make install'"; exit 1)
	@cd frontend && CI=true npx vitest run --reporter=dot --no-coverage src/utils/__tests__/dateFormat.test.ts >/dev/null 2>&1 && echo "✓ vitest smoke test passes" || (echo "✗ vitest smoke test failed"; exit 1)
	@cd backend && DATABASE_URL='' uv run python manage.py check >/dev/null 2>&1 && echo "✓ django check passes" || (echo "✗ django check failed"; exit 1)
# Chromium is a BUILD dependency, not E2E-only: `npm run build` runs
# frontend/scripts/prerender.js, which calls chromium.launch(). A machine
# without it gets a green `vite build` and a dead prerender.
# Launches the browser rather than asking Playwright whether it is
# installed: `playwright install --dry-run` exits 0 even when the binary is
# absent (measured), and executablePath() names the HEADED build while
# headless launch resolves chromium_headless_shell, so neither proves what
# prerender needs. Launch+close costs ~0.2 s and is validated on the
# failing path: removing chromium_headless_shell-<rev> makes it exit 1.
# Warns rather than fails -- a dev who only runs `npm run dev` never needs
# the browser, and setup-dev-machine.sh makes the install opt-in.
	@cd frontend && node -e 'require("playwright").chromium.launch({headless:true}).then(b=>b.close()).then(()=>process.exit(0)).catch(()=>process.exit(1))' >/dev/null 2>&1 && echo "✓ playwright chromium launches" || echo "⚠ playwright chromium missing or version-mismatched — 'npm run build' will fail at prerender; run 'cd frontend && npx playwright install chromium'"
	@echo "═══ all verify-setup checks passed ═══"

install:
	npm install
	cd backend && uv sync --extra dev

dev:
	./scripts/start-dev.sh

dev-local:
	npm run dev

dev-clean:
	./scripts/ports.sh --kill
	npm run dev

dev-docker:
	docker compose -f docker-compose.dev.yml up

ports:
	./scripts/ports.sh

kill-ports:
	./scripts/ports.sh --kill

build:
	docker compose build

test:
	npx concurrently -n fe,be -c cyan,green "cd frontend && npx vitest run" "cd backend && DATABASE_URL='' uv run python manage.py test"

test-ci:
	npx concurrently -n fe,be -c cyan,green "cd frontend && npx vitest run --coverage" "cd backend && DATABASE_URL='' uv run coverage run --source=api manage.py test && uv run coverage report"

lint:
	cd frontend && npx eslint src
	cd backend && uv run black --check . && uv run flake8

lint-fix:
	cd frontend && npx eslint src --fix
	cd backend && uv run black .

clean:
	rm -rf frontend/build/* frontend/node_modules/.cache
	find backend -type d -name '__pycache__' -exec rm -rf {} +
	rm -rf backend/staticfiles

deploy:
	@echo "Deploying..."
	docker compose build
	docker compose up -d

logs:
	docker compose logs -f

logs-security:
	docker compose exec backend cat /app/logs/security.log 2>/dev/null || echo "No security log yet"

logs-debug:
	docker compose exec backend tail -100 /app/logs/debug.log 2>/dev/null || echo "No debug log yet"

health: ## Docker health diagnostic (containers, resources, endpoints, errors)
	./scripts/health-check.sh

ps:
	docker compose ps

down:
	docker compose down

restart:
	docker compose restart

migrate:
	docker compose exec backend uv run python manage.py migrate

shell:
	docker compose exec backend uv run python manage.py shell

createsuperuser:
	docker compose exec backend uv run python manage.py createsuperuser

update-test-counts:
	./scripts/update-test-counts.sh

cleanup-visits:
	@SAFE_DAYS="$(if $(DAYS),$(DAYS),90)"; \
	if ! echo "$$SAFE_DAYS" | grep -qE '^[0-9]+$$'; then \
		echo "Error: DAYS must be a number"; exit 1; \
	fi; \
	docker compose exec backend uv run python manage.py cleanup_sitevisits --days "$$SAFE_DAYS"

setup-cron:
	@mkdir -p $(CURDIR)/backend/logs
	@DOCKER_BIN="$$(command -v docker)"; \
	if [ -z "$$DOCKER_BIN" ]; then \
		echo "Error: docker not found in PATH. Install Docker Desktop first."; exit 1; \
	fi; \
	echo "Adding daily SiteVisit cleanup cron job (3 AM)..."; \
	echo "Using docker binary: $$DOCKER_BIN"; \
	(crontab -l 2>/dev/null | grep -v cleanup_sitevisits; \
	 echo "0 3 * * * cd '$(CURDIR)' && $$DOCKER_BIN compose exec -T backend uv run python manage.py cleanup_sitevisits --days 90 >> '$(CURDIR)/backend/logs/sitevisit-cleanup.log' 2>&1") | crontab -; \
	echo "Cron job added. Verify with: crontab -l"

setup-health-cron: ## Install health check cron (every 5 min, logs failures only)
	@mkdir -p $(CURDIR)/backend/logs
	@echo "Adding health check cron job (every 5 min)..."
	@(crontab -l 2>/dev/null | grep -v health-check; \
	 echo "*/5 * * * * cd '$(CURDIR)' && ./scripts/health-check.sh --quiet >> '$(CURDIR)/backend/logs/health-check.log' 2>&1") | crontab -
	@echo "Cron job added. Verify with: crontab -l"
	@echo "Failures will be logged to: backend/logs/health-check.log"

remove-cron:
	@echo "Removing cron jobs..."
	@(crontab -l 2>/dev/null | grep -v cleanup_sitevisits | grep -v health-check) | crontab -
	@echo "Cron jobs removed."
