# WARNING: a zone-scoped `cloudflare_ruleset` manages the ENTIRE
# `http_request_firewall_custom` phase for the zone. Applying this ruleset
# adopts/replaces any existing custom firewall rules configured for
# `tribalorigin.com` (via the dashboard or API). If other custom rules exist,
# add them as additional `rules {}` blocks here. The API token also needs
# Zone WAF (Edit) permission for the zone.
resource "cloudflare_ruleset" "media_private_block" {
  zone_id = var.cloudflare_zone_id
  name    = "Block public access to private media"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "block"
    expression  = "(http.host eq \"${local.media_staging_domain}\" or http.host eq \"${local.media_domain}\") and starts_with(http.request.uri.path, \"/private/\")"
    description = "Block /private/ prefix on media domains"
    enabled     = true
  }
}
