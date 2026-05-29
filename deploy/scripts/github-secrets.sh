#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
TF_DIR="$DEPLOY_DIR/terraform"
SSL_DIR="$DEPLOY_DIR/ssl"

cd "$TF_DIR"

SERVER_IP=$(terraform output -raw server_ip)

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  GitHub Secrets — copy-paste into:"
echo "  Settings → Secrets and variables → Actions → New repository secret"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Required secrets (5):"
echo ""

# HETZNER_HOST
echo "──────────── HETZNER_HOST ─────────────────────────────────────"
echo "$SERVER_IP"
echo ""

# HETZNER_USER
echo "──────────── HETZNER_USER ─────────────────────────────────────"
echo "root"
echo ""

# HETZNER_SSH_KEY
PUB_KEY=$(grep "^ssh_public_key_path" "$TF_DIR/terraform.tfvars" 2>/dev/null | sed -E 's/.*= *"(.+)".*/\1/' || true)
DERIVED_PRIV="${PUB_KEY%.pub}"
echo "──────────── HETZNER_SSH_KEY ──────────────────────────────────"
echo "Paste your private SSH key here."
if [ -n "$DERIVED_PRIV" ]; then
  echo "File: $DERIVED_PRIV"
else
  echo "File: ~/.ssh/id_ed25519 (or whatever key you used for Terraform)"
fi
echo ""

# GH_TOKEN
echo "──────────── GH_TOKEN ─────────────────────────────────────────"
echo "Create a Classic PAT: https://github.com/settings/tokens/new?type=classic"
echo "Required scope: read:packages"
echo ""

# ENV_FILE
echo "──────────── ENV_FILE ─────────────────────────────────────────"
echo "<leave empty — this static site has no runtime env vars>"
echo ""

echo ""
echo "Optional secrets (3):"
echo ""

# CF_ORIGIN_CERT
echo "──────────── CF_ORIGIN_CERT (optional) ────────────────────────"
echo "If you set this, the deploy workflow will auto-copy certs to the server."
echo "If you skip it, you must manually SCP certs once (see deploy/README.md)."
echo ""
terraform output -raw sinkai_origin_certificate
echo ""

# CF_ORIGIN_KEY
echo "──────────── CF_ORIGIN_KEY (optional) ─────────────────────────"
echo ""
terraform output -raw sinkai_origin_private_key
echo ""

# HCLOUD_TOKEN
echo "──────────── HCLOUD_TOKEN (optional) ──────────────────────────"
echo "Not needed for app deploys. Only required if you run Terraform in CI."
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Why the differences from your other repo?"
echo "  • CF_ORIGIN_CERT/KEY are new — they automate cert deployment in CI."
echo "    Your other repo didn't have these because certs were copied manually."
echo "  • HCLOUD_TOKEN was in your other repo but isn't needed here since"
echo "    Terraform runs locally, not in GitHub Actions."
echo "  • ENV_FILE is empty here because this is a static Next.js site"
echo "    with no backend / database / runtime config."
echo ""
