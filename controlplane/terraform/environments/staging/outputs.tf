output "server_ip" {
  description = "Public IPv4 address of the staging server"
  value       = module.controlplane.server_ip
}

output "server_id" {
  description = "Hetzner staging server ID"
  value       = module.controlplane.server_id
}

output "next_steps" {
  description = "Post-provisioning instructions"
  value       = <<-EOF

✅ Staging server provisioned!

── 1. Copy Traefik to the staging server ────────────────────

   scp -r ../../docker-compose.staging.yml ../../traefik.staging.yml root@${module.controlplane.server_ip}:/opt/traefik/
   ssh root@${module.controlplane.server_ip} 'cd /opt/traefik && docker network create staging || true && docker compose -f docker-compose.staging.yml up -d'

── 2. Set Cloudflare SSL/TLS mode ───────────────────────────

   Go to: Cloudflare → SSL/TLS → Overview
   Set to: "Full (strict)" (Let's Encrypt certs are publicly trusted)

── 3. Add GitHub Secrets ────────────────────────────────────

   Staging deploys:
     STAGING_HETZNER_HOST = ${module.controlplane.server_ip}
     STAGING_HETZNER_USER = root
     STAGING_HETZNER_SSH_KEY = <your private SSH key>

── 4. Deploy an app ─────────────────────────────────────────

   Push to main branch → deploys to staging

EOF
}
