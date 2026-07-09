.PHONY: dev up down logs status clean build migrate help

PROD_COMPOSE := docker compose -f docker-compose.prod.yml

help:
	@echo "AKAL Center — Commands"
	@echo "  make dev       Start dev (only postgres + redis)"
	@echo "  make build     Build production Docker image"
	@echo "  make up        Start all production services"
	@echo "  make down      Stop all services"
	@echo "  make restart   Restart app only"
	@echo "  make logs      Tail all logs"
	@echo "  make logs-app  Tail app logs only"
	@echo "  make status    Show service status"
	@echo "  make clean     Stop and remove volumes"
	@echo "  make shell     Open app container shell"

dev:
	docker compose -f docker-compose.yml up -d

build:
	$(PROD_COMPOSE) build --no-cache

up:
	$(PROD_COMPOSE) up -d --build

down:
	$(PROD_COMPOSE) down

restart:
	$(PROD_COMPOSE) restart app

logs:
	$(PROD_COMPOSE) logs -f

logs-app:
	$(PROD_COMPOSE) logs -f app

status:
	$(PROD_COMPOSE) ps

clean:
	$(PROD_COMPOSE) down -v

shell:
	$(PROD_COMPOSE) exec app sh
