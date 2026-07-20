.PHONY: up down infra certs secrets

up:
	# Start the CMS in dev mode first so the web build can fetch data.
	docker compose up -d --build cms
	@echo "Waiting for CMS to be ready on http://localhost:3001..."
	@ready=0; \
	for i in $$(seq 1 60); do \
		if curl -sf http://localhost:3001/api/blogs > /dev/null 2>&1 \
		   && curl -sf http://localhost:3001/api/globals/navigation > /dev/null 2>&1; then \
			echo "CMS is ready."; \
			sleep 2; \
			ready=1; \
			break; \
		fi; \
		echo "  CMS not ready yet, sleeping... (attempt $$i/60)"; \
		sleep 3; \
	done; \
	if [ "$$ready" -ne 1 ]; then \
		echo "CMS failed to become ready after 180 seconds; aborting."; \
		docker compose logs cms --tail 50; \
		exit 1; \
	fi
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
