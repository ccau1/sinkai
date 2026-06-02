output "server_ip" {
  description = "Public IPv4 address of the dev server"
  value       = module.controlplane.server_ip
}

output "server_id" {
  description = "Hetzner dev server ID"
  value       = module.controlplane.server_id
}

output "next_steps" {
  description = "Post-provisioning instructions"
  value       = <<-EOF

✅ Dev server provisioned!

── 1. Copy Traefik to the dev server ────────────────────────

   scp -r ../../docker-compose.dev.yml ../../traefik.dev.yml root@${module.controlplane.server_ip}:/opt/traefik/
   ssh root@${module.controlplane.server_ip} 'cd /opt/traefik && docker network create dev || true && docker compose -f docker-compose.dev.yml up -d'

── 2. Set Cloudflare SSL/TLS mode ───────────────────────────

   Go to: Cloudflare → SSL/TLS → Overview
   Set to: "Full (strict)" (Let's Encrypt certs are publicly trusted)

── 3. Add GitHub Secrets ────────────────────────────────────

   Dev deploys:
     DEV_HETZNER_HOST = ${module.controlplane.server_ip}
     DEV_HETZNER_USER = root
     DEV_HETZNER_SSH_KEY = <your private SSH key>

── 4. Deploy an app ─────────────────────────────────────────

   Push to develop branch → deploys to dev

EOF
}
