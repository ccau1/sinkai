resource "hcloud_ssh_key" "deploy" {
  name       = "${var.env}-deploy"
  public_key = file(var.ssh_public_key_path)
}

resource "hcloud_firewall" "web" {
  name = "${var.env}-firewall"

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "22"
    source_ips  = ["0.0.0.0/0", "::/0"]
    description = "SSH"
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "80"
    source_ips  = ["0.0.0.0/0", "::/0"]
    description = "HTTP"
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "443"
    source_ips  = ["0.0.0.0/0", "::/0"]
    description = "HTTPS"
  }
}

resource "hcloud_server" "app" {
  name         = var.env
  server_type  = var.server_type
  image        = "ubuntu-24.04"
  location     = var.location
  ssh_keys     = [hcloud_ssh_key.deploy.id]
  firewall_ids = [hcloud_firewall.web.id]
  backups      = var.enable_backups

  labels = {
    env = var.env
  }

  # Bootstrap Docker and create app directory
  user_data = <<-EOF
    #cloud-config
    package_update: true
    packages:
      - fail2ban
    runcmd:
      - curl -fsSL https://get.docker.com | sh
      - usermod -aG docker root
      - mkdir -p /opt/traefik /opt/apps
      - docker network create ${var.env} || true
      - systemctl enable --now docker
  EOF
}

# ── Cloudflare DNS Record ──────────────────────────────────────

resource "cloudflare_record" "wildcard" {
  count = var.cloudflare_zone_id != "" ? 1 : 0

  zone_id = var.cloudflare_zone_id
  name    = "*-${var.env}"
  type    = "A"
  content = hcloud_server.app.ipv4_address
  ttl     = 1
  proxied = var.cloudflare_proxied
}
