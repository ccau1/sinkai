FROM node:22-slim

# Install sqlite3 so the container can clean up dev-mode migration markers
# before running Payload migrations non-interactively.
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace manifests and install dependencies
COPY package.json package-lock.json ./
COPY packages/web/package.json packages/web/
COPY packages/cms/package.json packages/cms/
RUN npm ci

# Copy the CMS source and the web public assets the seed script references
COPY packages/cms/ packages/cms/
COPY packages/web/public packages/web/public

EXPOSE 3001

ENV NODE_ENV=development

# Run pending migrations, then start the Payload/Next dev server.
# Seeding is intentionally separate; run `make seed` or `make up-seed` when you need seed data.
CMD ["sh", "-c", "for db in /app/packages/cms/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite; do [ -f \"$db\" ] && sqlite3 \"$db\" \"DELETE FROM payload_migrations WHERE batch = -1;\" 2>/dev/null || true; done; npm run migrate -w packages/cms && npm run dev -w packages/cms"]
