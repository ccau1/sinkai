.PHONY: up down infra certs secrets seed up-seed

# Set SEED=true to seed the local CMS before starting, e.g. `make up SEED=true`.
# Or use `make up-seed` as a shortcut.
up:
ifeq ($(SEED),true)
	$(MAKE) seed
endif
	# Start the CMS in dev mode first so the web build can fetch data.
	docker compose up -d --build cms
	@echo "Waiting for CMS to be ready on http://localhost:3001..."
	@ready=0; \
	for i in $$(seq 1 180); do \
		if curl -sf http://localhost:3001/api/blogs > /dev/null 2>&1 \
		   && curl -sf http://localhost:3001/api/globals/navigation > /dev/null 2>&1; then \
			echo "CMS is ready."; \
			sleep 2; \
			ready=1; \
			break; \
		fi; \
		echo "  CMS not ready yet, sleeping... (attempt $$i/180)"; \
		sleep 3; \
	done; \
	if [ "$$ready" -ne 1 ]; then \
		echo "CMS failed to become ready after 540 seconds; aborting."; \
		docker compose logs cms --tail 50; \
		exit 1; \
	fi
	# Build the web app (standalone Node server with ISR) against the local CMS.
	# Stop/remove any running web container so its read-only bind mounts do not
	# lock the standalone output directories during the build.
	docker compose rm -fs app
	# Clean the previous build so stale fetch cache and prerendered pages
	# (e.g. old blog shortId URLs) are not reused.
	rm -rf packages/web/.next
	CMS_API_URL=http://localhost:3001 NEXT_PUBLIC_CMS_API_URL=http://localhost:3001 npm run build -w packages/web
	# Ensure mountpoint directories exist inside the read-only standalone output
	# so Docker can bind-mount the public and static asset volumes.
	mkdir -p packages/web/.next/standalone/packages/web/public
	mkdir -p packages/web/.next/standalone/packages/web/.next/static
	# Start/recreate the web container so it picks up the freshly built output.
	docker compose up -d --force-recreate app

seed:
	@if docker compose ps cms --status running --format '{{.Name}}' | grep -q .; then \
		echo "CMS is currently running. Stop it first with 'make down', then run 'make seed'."; \
		exit 1; \
	fi
	@echo "Running CMS migrations + seed inside a one-off container..."
	docker compose run --rm cms sh -c 'npm run migrate -w packages/cms && npm run seed -w packages/cms'

up-seed: seed
	$(MAKE) up

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
	@echo "  - RESEND_API_KEY"
	@echo "  - REVALIDATE_SECRET_STAGING"
	@echo "  - REVALIDATE_SECRET_PROD"
