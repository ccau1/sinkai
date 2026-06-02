output "server_ip" {
  description = "Public IPv4 address of the server"
  value       = hcloud_server.app.ipv4_address
}

output "server_id" {
  description = "Hetzner server ID"
  value       = hcloud_server.app.id
}

output "ssh_key_name" {
  description = "Name of the Hetzner SSH key"
  value       = hcloud_ssh_key.deploy.name
}

output "firewall_name" {
  description = "Name of the Hetzner firewall"
  value       = hcloud_firewall.web.name
}
