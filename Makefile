# ============================================================
# CodeResidency - Developer Makefile
# ============================================================

.PHONY: dev dev-backend dev-frontend build down logs clean setup help

# Start all services
dev:
	docker compose up --build

# Start only backend + dependencies (Appwrite, Redis)
dev-backend:
	docker compose up appwrite appwrite-worker appwrite-db redis backend --build

# Start only frontend
dev-frontend:
	docker compose up frontend --build

# Build all images without starting
build:
	docker compose build

# Stop all services
down:
	docker compose down

# Stop and remove volumes (fresh start)
clean:
	docker compose down -v --remove-orphans

# Show logs for all services
logs:
	docker compose logs -f

# Show logs for a specific service: make logs-backend
logs-%:
	docker compose logs -f $*

# First-time setup: copy env file
setup:
	@if not exist .env (copy .env.example .env && echo "Created .env - please fill in your API keys")
	@echo "Setup complete. Edit .env with your values, then run 'make dev'"

# Run backend tests
test-backend:
	docker compose run --rm backend poetry run pytest tests/ -v

# Run frontend tests
test-frontend:
	docker compose run --rm frontend npm run test

help:
	@echo ""
	@echo "  CodeResidency Developer Commands"
	@echo "  --------------------------------"
	@echo "  make setup          First-time setup (copies .env.example)"
	@echo "  make dev            Start all services"
	@echo "  make dev-backend    Start backend + infra only"
	@echo "  make dev-frontend   Start frontend only"
	@echo "  make build          Build Docker images"
	@echo "  make down           Stop all services"
	@echo "  make clean          Stop & remove all volumes"
	@echo "  make logs           Tail all logs"
	@echo "  make logs-backend   Tail backend logs only"
	@echo "  make test-backend   Run backend test suite"
	@echo ""
