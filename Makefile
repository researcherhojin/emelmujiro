.PHONY: help install dev dev-local dev-clean dev-docker ports kill-ports build test test-ci lint lint-fix clean deploy logs logs-security logs-debug ps down restart migrate shell createsuperuser update-test-counts cleanup-visits setup-cron remove-cron

help:
	@echo "Available commands:"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development servers (Docker)"
	@echo "  make dev-local   - Start local development servers"
	@echo "  make dev-clean   - Kill ports and start dev servers"
	@echo "  make build       - Build production images"
	@echo "  make test        - Run all tests"
	@echo "  make test-ci     - Run all tests (CI mode, no watch)"
	@echo "  make lint        - Run linters"
	@echo "  make lint-fix    - Auto-fix lint issues"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make ports       - Check port status"
	@echo "  make kill-ports  - Kill all dev ports"

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
	rm -rf frontend/build frontend/node_modules/.cache
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
	@echo "Adding daily SiteVisit cleanup cron job (3 AM)..."
	@(crontab -l 2>/dev/null | grep -v cleanup_sitevisits; echo "0 3 * * * cd '$(CURDIR)' && docker compose exec -T backend uv run python manage.py cleanup_sitevisits --days 90 >> /tmp/cleanup_sitevisits.log 2>&1") | crontab -
	@echo "Cron job added. Verify with: crontab -l"

remove-cron:
	@echo "Removing SiteVisit cleanup cron job..."
	@(crontab -l 2>/dev/null | grep -v cleanup_sitevisits) | crontab -
	@echo "Cron job removed."
