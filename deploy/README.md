# Deploy

This folder contains everything you need to deploy this app to a remote server via Docker Compose. It is designed to be **copy-pasteable into another repo** — just grab the `deploy/` folder, update `.env`, and run the scripts.

## What's Inside

```
deploy/
├── .env.example              # Configuration template
├── docker-compose.{env}.yml  # Per-environment compose files
├── nginx.{env}.conf          # Per-environment nginx configs
├── scripts/
│   ├── setup-server.sh       # One-time server setup (idempotent)
│   ├── deploy.sh             # Deploy the app (idempotent)
│   └── health-check.sh       # Verify the deployment
└── traefik/                  # Traefik reverse proxy configs (dev/staging)
    ├── docker-compose.yml
    └── traefik.yml
```

## Quick Start

### 1. Configure

```bash
cp deploy/.env.example deploy/.env
# Edit deploy/.env with your values
```

Example for staging:

```bash
HOST=178.105.230.92
ENV=staging
APP_IMAGE=ghcr.io/your-org/your-repo:staging
ACME_EMAIL=you@example.com
HEALTH_URL=https://your-app.staging.example.com
```

### 2. Set up the server (one time)

This is **idempotent** — safe to run multiple times. It installs Docker, creates the shared network, and starts Traefik (for dev/staging).

```bash
./deploy/scripts/setup-server.sh
```

### 3. Deploy

This is also **idempotent** — running it again just restarts containers with the latest image.

```bash
./deploy/scripts/deploy.sh
```

### 4. Health check (optional)

```bash
./deploy/scripts/health-check.sh
```

---

## Copying to Another Repo

To reuse this setup in a different project:

1. **Copy the folder:**
   ```bash
   cp -r deploy/ /path/to/other-repo/
   ```

2. **Create compose files** for your environments (`docker-compose.staging.yml`, etc.)

3. **Configure `.env`** and run the same two commands:
   ```bash
   ./deploy/scripts/setup-server.sh
   ./deploy/scripts/deploy.sh
   ```

The scripts are completely generic — no hardcoded project names, domains, or paths. Everything is driven by `.env`.

---

## Script Reference

### `setup-server.sh`

Idempotent server preparation. Safe to run on a fresh or existing server.

**What it does:**
- Installs Docker if missing
- Creates the external Docker network (`dev`, `staging`, etc.)
- For `dev`/`staging`: copies Traefik configs and starts Traefik
- Does nothing if everything is already in place

**Required env:** `HOST`, `ENV`

### `deploy.sh`

Idempotent app deployment.

**What it does:**
- Copies `docker-compose.{ENV}.yml` and `nginx.{ENV}.conf` to the server
- Logs into GHCR (if `GHCR_TOKEN` is set)
- Pulls the image and restarts containers
- Prunes old images
- Runs a health check (if `HEALTH_URL` is set)

**Required env:** `HOST`, `ENV`, `APP_IMAGE`

### `health-check.sh`

Polls `HEALTH_URL` up to 12 times (60 seconds total).

**Required env:** `HEALTH_URL`

---

## Environment Differences

| Environment | Reverse Proxy | SSL | Network |
|-------------|---------------|-----|---------|
| `dev` | Traefik | Let's Encrypt | `dev` (external) |
| `staging` | Traefik | Let's Encrypt | `staging` (external) |
| `prod` (shared, CI) | Existing shared Traefik | Let's Encrypt | `prod` (external) |
| `prod` (standalone) | nginx (direct) | Cloudflare Origin CA | bridge |

- **Dev/Staging** share a server with Traefik. Each app container joins the external Docker network and gets auto-discovered via Traefik labels.
- **Prod** runs nginx directly on ports 80/443 with a Cloudflare Origin CA certificate. No Traefik needed.

---

## GitHub Actions Integration

The scripts are designed to work standalone, but they also pair well with CI. Example workflow step:

```yaml
- name: Deploy
  env:
    HOST: ${{ secrets.STAGING_HOST }}
    ENV: staging
    APP_IMAGE: ghcr.io/${{ github.repository }}:staging
    SSH_KEY: ${{ secrets.SSH_KEY }}
    GHCR_TOKEN: ${{ secrets.GH_TOKEN }}
  run: |
    echo "$SSH_KEY" > /tmp/deploy_key
    chmod 600 /tmp/deploy_key
    export SSH_KEY=/tmp/deploy_key
    ./deploy/scripts/deploy.sh
```

---

## Production Infrastructure (Terraform)

For prod, the server and DNS are managed by Terraform in `deploy/terraform/environments/prod/`.

📖 **See [`deploy/terraform/README.md`](terraform/README.md) for full Terraform docs:** environment structure, state isolation, adding new environments, and destroy safety.

Quick start below:

<details>
<summary>Original prod Terraform docs (click to expand)</summary>

### Prerequisites

- [Hetzner Cloud](https://console.hetzner.cloud/) account
- Terraform or OpenTofu installed locally
- An SSH key pair

### 1. Hetzner UI Setup (One-time)

1. Go to [console.hetzner.cloud](https://console.hetzner.cloud/)
2. Create a new project
3. Navigate to **Security → API Tokens**
4. Generate a token with **Read & Write** permissions

### 2. Create the Server with Terraform

```bash
cd deploy/terraform/environments/prod
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and add your tokens

terraform init
make infra
```

### 3. SSL Certificate Setup

**Shared prod (CI)**: The server already runs a shared Traefik instance that manages Let's Encrypt certificates automatically. No manual cert setup is needed as long as the domain points to the server and Traefik is on the `prod` Docker network.

**Standalone prod**: Terraform creates a Cloudflare Origin CA certificate automatically. Extract and push it:

```bash
./deploy/scripts/push-certs.sh
```

Then set Cloudflare SSL/TLS mode to **"Full (strict)"**.

### 4. GitHub Secrets

| Secret | Required | Value |
|--------|----------|-------|
| `PROD_HETZNER_HOST` | ✅ | Server IP |
| `PROD_HETZNER_USER` | ✅ | `root` |
| `PROD_HETZNER_SSH_KEY` | ✅ | Private SSH key |
| `PROD_ENV_FILE` | ✅ | Empty for static sites |
| `GH_TOKEN` | ✅ | GitHub Classic PAT (`read:packages`) |

### 5. First Deploy

Push to `main` or trigger the workflow manually.

</details>
