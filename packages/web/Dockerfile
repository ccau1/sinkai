FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace manifests and the web package manifest
COPY package.json package-lock.json ./
COPY packages/web/package.json packages/web/

# Install all workspace dependencies
RUN npm ci

# Copy the web package source and build it.
# The build prerenders pages from the CMS (ISR), so it needs a reachable CMS.
COPY packages/web/ packages/web/
ARG CMS_API_URL
ARG NEXT_PUBLIC_CMS_API_URL
RUN npm run build -w packages/web

# Node server runner using the Next.js standalone output. ISR revalidation
# reads CMS_API_URL from the runtime environment.
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/packages/web/.next/standalone ./
COPY --from=builder /app/packages/web/.next/static ./packages/web/.next/static
COPY --from=builder /app/packages/web/public ./packages/web/public

EXPOSE 3000

CMD ["node", "packages/web/server.js"]
