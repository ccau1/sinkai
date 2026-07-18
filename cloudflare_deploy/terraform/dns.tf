locals {
  web_domain         = "${var.web_subdomain}.${var.domain}"
  web_staging_domain = "${var.web_staging_subdomain}.${var.domain}"
  cms_domain         = "${var.cms_subdomain}.${var.domain}"
  cms_staging_domain = "${var.cms_staging_subdomain}.${var.domain}"
}

# Web subdomain DNS records for Cloudflare Pages are created automatically when
# custom domains are attached to a Pages project (see pages.tf).
#
# CMS subdomain route/DNS is managed by wrangler (see packages/cms/wrangler.jsonc
# via `routes` with `custom_domain: true`).
