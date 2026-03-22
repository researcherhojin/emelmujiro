.PHONY: help install dev dev-local dev-clean dev-docker ports kill-ports build test test-ci lint lint-fix clean deploy-staging deploy-production logs ps down restart migrate shell createsuperuser update-test-counts cleanup-visits

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
	cd frontend && npx vitest run
	cd backend && DATABASE_URL="" uv run python manage.py test

test-ci:
	cd frontend && npx vitest run --no-coverage
	cd backend && DATABASE_URL="" uv run coverage run --source='.' manage.py test && uv run coverage report

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

deploy-staging:
	docker compose build
	docker compose up -d

deploy-production:
	@echo "Deploying to production..."
	docker compose build
	docker compose up -d

logs:
	docker compose logs -f

ps:
	docker compose ps

down:
	docker compose down

restart:
	docker compose restart

migrate:
	docker compose exec backend python manage.py migrate

shell:
	docker compose exec backend python manage.py shell

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

update-test-counts:
	./scripts/update-test-counts.sh

cleanup-visits:
	docker exec emelmujiro-backend python manage.py cleanup_sitevisits --days $(or $(DAYS),90)
