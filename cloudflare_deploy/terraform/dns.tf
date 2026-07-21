locals {
  web_domain           = "${var.web_subdomain}.${var.domain}"
  web_staging_domain   = "${var.web_staging_subdomain}.${var.domain}"
  cms_domain           = "${var.cms_subdomain}.${var.domain}"
  cms_staging_domain   = "${var.cms_staging_subdomain}.${var.domain}"
  media_domain         = "${var.media_subdomain}.${var.domain}"
  media_staging_domain = "${var.media_staging_subdomain}.${var.domain}"
}

# DNS for the web custom domains is created automatically by Cloudflare when
# the web worker attaches them via `routes` (custom_domain: true) in
# packages/web/wrangler.jsonc — same mechanism as the CMS worker. The explicit
# CNAME records to *.pages.dev were removed as part of the Pages → Worker
# migration (see pages.tf).

# CMS subdomain route/DNS is managed by wrangler (see packages/cms/wrangler.jsonc
# via `routes` with `custom_domain: true`).
