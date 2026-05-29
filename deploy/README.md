# Deploying Sinkai to Hetzner Cloud

## Architecture

A single Hetzner server runs the Next.js static export via Docker Compose:

```
┌──────────────────────────────┐
│      Hetzner Cloud VM        │
│  ┌────────────────────────┐  │
│  │  nginx (:80 / :443)    │  │
│  │  Next.js static export │  │
│  └────────────────────────┘  │
│         Docker Network       │
└──────────────────────────────┘
```

- **nginx** (port 80/443) serves the built Next.js static export
- Cloudflare proxy provides CDN, DDoS protection, and free SSL to visitors
- Cloudflare Origin CA certificate encrypts traffic between Cloudflare and the origin

## Prerequisites

- [Hetzner Cloud](https://console.hetzner.cloud/) account
- [GitHub](https://github.com) repository (this one)
- Terraform or OpenTofu installed locally (`brew install terraform` or `brew install opentofu`)
- An SSH key pair (create one: `ssh-keygen -t ed25519 -C "deploy@sinkai"`)

---

## 1. Hetzner UI Setup (One-time)

You only need to do **one thing** in the Hetzner UI:

1. Go to [console.hetzner.cloud](https://console.hetzner.cloud/)
2. Create a new project (e.g., `sinkai`)
3. Navigate to **Security → API Tokens**
4. Generate a token with **Read & Write** permissions
5. **Save the token** — you won't see it again

## Optional: Cloudflare DNS Setup

If you want the custom domain `sinkai.tribalorigin.com`, grab these from your Cloudflare dashboard:

| Value | Where to find it |
|-------|-----------------|
| **Zone ID** | Cloudflare → `tribalorigin.com` → Overview → right sidebar |
| **API Token** | Cloudflare → My Profile → API Tokens → Create Token → Use "Edit zone DNS" template |

The Terraform config will automatically create the DNS record and point it to your Hetzner server. If you set `cloudflare_proxied = true` (default), you get **free HTTPS + CDN** without setting up certs on the server.

> **No `cloudflare_account_id` needed** — the provider only needs `api_token` + `zone_id` to manage DNS records.

> **Cloudflare proxy is free** — the free plan includes DDoS protection, CDN caching, and free SSL. No credit card required.

---

## 2. Create the Server with Terraform (Local)

Everything — server, firewall, SSH key, DNS — is defined as code in `deploy/terraform/`.

```bash
# Copy example vars and add your tokens
cd deploy/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and paste your Hetzner + Cloudflare tokens

# Initialize
terraform init

# Option A: Run terraform apply and auto-deploy certs in one go
# You'll be prompted to pick or create an SSH key
make infra

# Option B: Run terraform manually, then push certs separately
cd deploy/terraform
terraform apply
../../deploy/scripts/push-certs.sh
```

When complete, Terraform outputs your server's public IP and domains:

```
server_ip = "116.203.x.x"
domains   = [
  "sinkai.tribalorigin.com",
]
```

**What gets created:**
- `cx23` server (2 Intel vCPU / 4 GB RAM) running Ubuntu 24.04
- Firewall allowing only SSH (22), HTTP (80), and HTTPS (443)
- Your SSH key attached to the server
- Docker & Docker Compose pre-installed via cloud-init
- `/opt/sinkai` directory ready for the app
- Cloudflare DNS A record pointing `sinkai.tribalorigin.com` to your server

> **SSH Key:** `make infra` will ask you to pick or create an SSH key. It defaults to scanning `~/.ssh/*.pub` and warns you if a key has a passphrase (passphrase-less keys are strongly recommended for CI automation). Your choice is saved to `deploy/terraform/terraform.tfvars`.

### Destroy infrastructure (if needed)

```bash
cd deploy/terraform
terraform destroy
```

---

## 3. SSL Certificate Setup (Cloudflare Origin CA)

Since we're using Cloudflare proxy, we use a **Cloudflare Origin CA certificate** — free, trusted by Cloudflare, and valid for 15 years.

Terraform creates this automatically, scoped to `sinkai.tribalorigin.com`.

### 3a. Extract the Certificate and Key

After `terraform apply`, run:

```bash
cd deploy/terraform

# Create SSL directory
mkdir -p ../ssl

# Extract certificate (safe to view, not sensitive)
terraform output -raw sinkai_origin_certificate > ../ssl/cloudflare-origin.pem

# Extract private key (sensitive — never commit to git)
terraform output -raw sinkai_origin_private_key > ../ssl/cloudflare-origin.key

# Set permissions
chmod 600 ../ssl/cloudflare-origin.key
chmod 644 ../ssl/cloudflare-origin.pem
```

### 3b. Upload to Server

> **This step is automated by the GitHub Actions deploy workflow** (via the `CF_ORIGIN_CERT` and `CF_ORIGIN_KEY` secrets). You only need to do this manually if you want the certs on the server before the first deploy.

Use the helper script (reads from Terraform outputs and copies via SSH):

```bash
./deploy/scripts/push-certs.sh
```

Or manually:

```bash
# From your local machine, copy the files
scp deploy/ssl/cloudflare-origin.pem deploy/ssl/cloudflare-origin.key root@YOUR_SERVER_IP:/opt/sinkai/ssl/

# Set permissions
ssh root@YOUR_SERVER_IP 'chmod 600 /opt/sinkai/ssl/cloudflare-origin.key && chmod 644 /opt/sinkai/ssl/cloudflare-origin.pem'
```

### 3c. Set Cloudflare SSL/TLS Mode

Go to **SSL/TLS** → **Overview** and set the mode to **"Full (strict)"**.

This tells Cloudflare to connect to your origin via HTTPS and validate the Origin CA certificate.

---

## 4. GitHub Secrets Setup

Go to **Settings → Secrets and variables → Actions** in your GitHub repo and add:

| Secret | Required | Value | How to get it |
|--------|----------|-------|---------------|
| `HETZNER_HOST` | ✅ Yes | Server IP | `terraform output server_ip` |
| `HETZNER_USER` | ✅ Yes | `root` | Hetzner Ubuntu images default to root |
| `HETZNER_SSH_KEY` | ✅ Yes | Your **private** SSH key | `cat ~/.ssh/id_ed25519` |
| `ENV_FILE` | ✅ Yes | Empty (see below) | Leave blank |
| `GH_TOKEN` | ✅ Yes | GitHub classic PAT | See below |
| `CF_ORIGIN_CERT` | ⬜ No | Cloudflare Origin CA cert | `cat deploy/ssl/cloudflare-origin.pem` |
| `CF_ORIGIN_KEY` | ⬜ No | Cloudflare Origin CA key | `cat deploy/ssl/cloudflare-origin.key` |
| `HCLOUD_TOKEN` | ⬜ No | Hetzner API token | Only needed if you run Terraform in CI |

### ENV_FILE format

For this static Next.js export, **leave this secret empty**. There are no runtime env vars needed (no backend, no database, no API keys at runtime).

If you add `NEXT_PUBLIC_*` variables later, update `deploy/.env.example` and paste its contents here.

### Creating the GH_TOKEN (Classic PAT)

The server needs to pull Docker images from GitHub Container Registry (GHCR). `GITHUB_TOKEN` only works inside GitHub Actions, not on external servers.

1. Go to **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Generate new token (classic)
3. Scopes needed: **`read:packages`**
4. Save the token as `GH_TOKEN` in your repo secrets

> **Note:** If your repo is public, you can skip `GH_TOKEN` and make the packages public. Go to the package settings after the first push and change visibility to public.

> **Fine-grained tokens don't work with GHCR** — this is a known GitHub limitation. Use classic tokens.

---

## 5. First Deploy

Push to `main` or trigger manually:

```bash
git push origin main
```

GitHub Actions will:
1. Build the Next.js static export + nginx Docker image
2. Push to GHCR
3. SSH into your Hetzner server
4. Write the Cloudflare Origin CA certificate and key to `/opt/sinkai/ssl/` (only if you set `CF_ORIGIN_CERT` / `CF_ORIGIN_KEY` secrets)
5. Pull the image and run `docker compose up -d`
6. Run a health check against `https://sinkai.tribalorigin.com`

You can also trigger a manual deploy from **Actions → Build & Deploy → Run workflow**.

### Verify it's running

```bash
ssh root@YOUR_SERVER_IP
cd /opt/sinkai
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

Then open `https://sinkai.tribalorigin.com` in your browser.

---

## 6. Costs

| Component | Specs | Monthly Cost |
|-----------|-------|--------------|
| Server (`cx23`) | 2 vCPU Intel, 4 GB RAM | **~€3.99** |
| Server (`cpx22`) | 2 vCPU AMD, 4 GB RAM | **~€7.99** |
| Backups (optional) | 20% of server cost | **~€0.80** |
| Bandwidth | 20 TB included | **Free** |
| GHCR (images) | Public repos = free | **Free** |
| Cloudflare Proxy | Free plan | **Free** |
| Cloudflare Origin CA | Free | **Free** |

**Total: ~€4-8/month** depending on server size.

---

## FAQ

**Q: Can I provision Hetzner entirely without clicking the UI?**
A: Almost. You need to create the Hetzner project and API token in the UI once. After that, everything (server, firewall, SSH keys, DNS) is Terraform code.

**Q: What if I want to change the server location?**
A: Edit `deploy/terraform/terraform.tfvars` and set `location = "fsn1"` (Falkenstein), `"hel1"` (Helsinki), `"ash"` (Ashburn), or `"hil"` (Hillsboro). Run `terraform apply` locally.

**Q: How do I scale up if I get more traffic?**
A: Run `terraform apply -var="server_type=cx33"` (4 vCPU / 8 GB, ~€6.49) or `terraform apply -var="server_type=cpx32"` (~€13.99). Docker Compose will start the container on the bigger box automatically.

**Q: Why isn't Terraform run in GitHub Actions?**
A: Terraform state needs to live somewhere persistent between runs (a "backend"). For a personal project, running `terraform apply` locally is simpler than setting up Terraform Cloud, S3, or committing state files to git. Infrastructure changes are rare — you might change your server size once a year. App deployments are frequent — they run automatically in GitHub Actions every time you push code.

**Q: Do I need `cloudflare_account_id`?**
A: No. The Cloudflare provider only needs `api_token` + `zone_id` to manage DNS records. Account ID is only for account-level resources like creating zones.

**Q: Does Cloudflare proxy cost money?**
A: No. The free plan includes proxy, DDoS protection, CDN caching, and free SSL. You only pay if you upgrade to Pro/Business for advanced features.
