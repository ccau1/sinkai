FROM node:22-slim

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

# Run pending migrations, seed the local D1 database on first start, then run the Payload/Next dev server.
CMD ["sh", "-c", "npm run migrate -w packages/cms && npm run seed -w packages/cms && npm run dev -w packages/cms"]
