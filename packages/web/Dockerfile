FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace manifests and the web package manifest
COPY package.json package-lock.json ./
COPY packages/web/package.json packages/web/

# Install all workspace dependencies
RUN npm ci

# Copy the web package source and build it
COPY packages/web/ packages/web/
RUN npm run build -w packages/web

FROM nginx:alpine

COPY --from=builder /app/packages/web/dist /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
