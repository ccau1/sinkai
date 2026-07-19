locals {
  web_domain         = "${var.web_subdomain}.${var.domain}"
  web_staging_domain = "${var.web_staging_subdomain}.${var.domain}"
  cms_domain         = "${var.cms_subdomain}.${var.domain}"
  cms_staging_domain = "${var.cms_staging_subdomain}.${var.domain}"
}

# Explicit DNS records for the Cloudflare Pages custom domains.
# Pages can create these automatically, but declaring them here ensures stale
# records (for example an old A record pointing at a previous host) are
# overwritten and kept in sync with the Pages project.
resource "cloudflare_record" "web" {
  zone_id         = var.cloudflare_zone_id
  name            = var.web_subdomain
  type            = "CNAME"
  content         = "${var.pages_project_name}.pages.dev"
  proxied         = true
  allow_overwrite = true
}

resource "cloudflare_record" "web_staging" {
  zone_id         = var.cloudflare_zone_id
  name            = var.web_staging_subdomain
  type            = "CNAME"
  content         = "${var.pages_staging_project_name}.pages.dev"
  proxied         = true
  allow_overwrite = true
}

# CMS subdomain route/DNS is managed by wrangler (see packages/cms/wrangler.jsonc
# via `routes` with `custom_domain: true`).
