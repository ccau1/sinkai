.PHONY: up down infra certs secrets

up:
	# Start the CMS in dev mode first so the web build can fetch data.
	docker compose up -d --build cms
	@echo "Waiting for CMS to be ready on http://localhost:3001..."
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
		if curl -sf http://localhost:3001/api/blogs > /dev/null 2>&1; then \
			echo "CMS is ready."; \
			break; \
		fi; \
		echo "  CMS not ready yet, sleeping..."; \
		sleep 3; \
	done
	# Build the static web site against the local CMS.
	CMS_API_URL=http://localhost:3001 npm run build -w packages/web
	# Start/recreate nginx so the bind mount picks up the freshly exported dist directory.
	docker compose up -d --force-recreate app

down:
	docker compose down

infra:
	cd deploy/terraform && terraform apply

certs:
	cd deploy/ssl && ./generate.sh

secrets:
	@echo "Set the following secrets in your GitHub repository:"
	@echo "  - CLOUDFLARE_API_TOKEN"
	@echo "  - CLOUDFLARE_ACCOUNT_ID"
	@echo "  - CLOUDFLARE_ZONE_ID"
	@echo "  - PAYLOAD_SECRET"
	@echo "  - CMS_API_URL_PROD"
	@echo "  - CMS_API_URL_STAGING"
