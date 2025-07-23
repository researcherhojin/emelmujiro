.PHONY: help install dev build test lint clean deploy

help:
	@echo "Available commands:"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development servers (Docker)"
	@echo "  make dev-local   - Start local development servers"
	@echo "  make dev-clean   - Kill ports and start dev servers"
	@echo "  make build       - Build production images"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linters"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make deploy      - Deploy to production"
	@echo "  make ports       - Check port status"
	@echo "  make kill-ports  - Kill all dev ports"

install:
	npm install
	cd backend && pip install -r requirements.txt
	npx husky install

dev:
	./scripts/start-dev.sh

dev-local:
	npm run dev

dev-clean:
	./scripts/kill-ports.sh
	npm run dev

dev-docker:
	docker-compose -f docker-compose.dev.yml up

ports:
	./scripts/check-ports.sh

kill-ports:
	./scripts/kill-ports.sh

build:
	docker-compose build

test:
	npm test
	cd backend && python manage.py test

test-ci:
	npm test -- --watchAll=false --passWithNoTests
	cd backend && coverage run --source='.' manage.py test && coverage report

lint:
	npm run lint:frontend
	cd backend && black --check . && flake8

lint-fix:
	cd frontend && eslint src --fix
	cd backend && black .

clean:
	npm run clean
	docker-compose down -v
	docker system prune -f

deploy-staging:
	docker-compose -f docker-compose.yml build
	docker-compose -f docker-compose.yml up -d

deploy-production:
	@echo "Deploying to production..."
	docker-compose -f docker-compose.yml build
	docker-compose -f docker-compose.yml up -d

logs:
	docker-compose logs -f

ps:
	docker-compose ps

down:
	docker-compose down

restart:
	docker-compose restart

migrate:
	docker-compose exec backend python manage.py migrate

shell:
	docker-compose exec backend python manage.py shell

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser