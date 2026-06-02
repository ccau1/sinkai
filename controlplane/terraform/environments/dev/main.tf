module "controlplane" {
  source = "../../modules/controlplane"

  env = "dev"

  hcloud_token        = var.hcloud_token
  ssh_public_key_path = var.ssh_public_key_path
  server_type         = var.server_type
  location            = var.location
  enable_backups      = var.enable_backups

  cloudflare_api_token = var.cloudflare_api_token
  cloudflare_zone_id   = var.cloudflare_zone_id
  cloudflare_proxied   = var.cloudflare_proxied
}
