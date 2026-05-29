.PHONY: up down infra certs secrets

up:
	docker compose up --build -d

down:
	docker compose down

infra:
	./deploy/scripts/apply.sh

certs:
	./deploy/scripts/push-certs.sh

secrets:
	./deploy/scripts/github-secrets.sh
