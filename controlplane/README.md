# Dev / Staging Control Plane

This folder simulates a standalone repository that manages the **dev and staging environment** infrastructure and Traefik reverse proxy.

In a real multi-repo setup, this would be its own Git repository (e.g., `tribalorigin/controlplane`).

## What's Inside

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Traefik reverse proxy container |
| `traefik.yml` | Traefik static configuration (entrypoints, Let's Encrypt, Docker provider) |
| `terraform/` | Provisions the dev and staging Hetzner servers + Cloudflare DNS |

## Architecture

```
Dev Server (Hetzner project: dev)
├── Traefik (:80 / :443) — reverse proxy + auto TLS
├── App A — Docker container with Traefik labels
├── App B — Docker container with Traefik labels
└── Shared Docker network: dev

Staging Server (Hetzner project: dev)
├── Traefik (:80 / :443) — reverse proxy + auto TLS
├── App A — Docker container with Traefik labels
├── App B — Docker container with Traefik labels
└── Shared Docker network: staging
```

Traefik auto-discovers app containers via Docker labels. No manual proxy config updates needed when adding apps.

## Provisioning the Servers

```bash
cd controlplane/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your tokens

terraform init
terraform apply
```

## Installing Traefik on a Server

After Terraform provisions a server:

```bash
# Copy Traefik files to the server
scp -r controlplane/docker-compose.yml controlplane/traefik.yml root@SERVER_IP:/opt/traefik/

# Start Traefik
ssh root@SERVER_IP 'cd /opt/traefik && docker compose up -d'
```

## Adding a New App to Dev or Staging

Any app repo can deploy by:

1. Joining the shared Docker network (`dev` for dev server, `staging` for staging server)
2. Adding Traefik labels to its `docker-compose.dev.yml` or `docker-compose.staging.yml`
3. Creating a Cloudflare DNS A record: `appname-dev.tribalorigin.com` or `appname-staging.tribalorigin.com`

Example app `docker-compose.dev.yml`:
```yaml
version: "3.9"
services:
  app:
    image: ghcr.io/user/app:dev
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myapp.rule=Host(`myapp-dev.tribalorigin.com`)"
      - "traefik.http.routers.myapp.entrypoints=websecure"
      - "traefik.http.routers.myapp.tls.certresolver=letsencrypt"
      - "traefik.http.services.myapp.loadbalancer.server.port=80"
    networks:
      - dev
    restart: unless-stopped

networks:
  dev:
    external: true
```

## SSL / TLS

Traefik uses **Let's Encrypt** to automatically provision and renew TLS certificates for each subdomain.

Cloudflare SSL/TLS mode for dev/staging: **Full (strict)**
