output "dev_server_ip" {
  description = "Public IPv4 address of the dev server"
  value       = hcloud_server.dev.ipv4_address
}

output "dev_server_id" {
  description = "Hetzner dev server ID"
  value       = hcloud_server.dev.id
}

output "staging_server_ip" {
  description = "Public IPv4 address of the staging server"
  value       = hcloud_server.staging.ipv4_address
}

output "staging_server_id" {
  description = "Hetzner staging server ID"
  value       = hcloud_server.staging.id
}

output "next_steps" {
  description = "Post-provisioning instructions"
  value       = <<-EOF

✅ Dev & Staging servers provisioned!

── 1. Copy Traefik to the dev server ────────────────────────

   scp -r controlplane/docker-compose.yml controlplane/traefik.yml root@${hcloud_server.dev.ipv4_address}:/opt/traefik/
   ssh root@${hcloud_server.dev.ipv4_address} 'cd /opt/traefik && docker network create dev || true && docker compose up -d'

── 2. Copy Traefik to the staging server ────────────────────

   scp -r controlplane/docker-compose.yml controlplane/traefik.yml root@${hcloud_server.staging.ipv4_address}:/opt/traefik/
   ssh root@${hcloud_server.staging.ipv4_address} 'cd /opt/traefik && docker network create staging || true && docker compose up -d'

── 3. Set Cloudflare SSL/TLS mode ───────────────────────────

   Go to: Cloudflare → SSL/TLS → Overview
   Set to: "Full (strict)" (Let's Encrypt certs are publicly trusted)

── 4. Add GitHub Secrets ────────────────────────────────────

   Dev deploys:
     DEV_HETZNER_HOST = ${hcloud_server.dev.ipv4_address}
     DEV_HETZNER_USER = root
     DEV_HETZNER_SSH_KEY = <your private SSH key>

   Staging deploys:
     STAGING_HETZNER_HOST = ${hcloud_server.staging.ipv4_address}
     STAGING_HETZNER_USER = root
     STAGING_HETZNER_SSH_KEY = <your private SSH key>

── 5. Deploy an app ─────────────────────────────────────────

   Push to develop branch  → deploys to dev
   Push to main branch     → deploys to staging
   Manual promote workflow → promotes staging image to prod

EOF
}
