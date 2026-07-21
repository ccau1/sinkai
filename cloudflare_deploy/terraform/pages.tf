# NOTE: The web site no longer deploys to Cloudflare Pages — it runs as a
# Cloudflare Worker (OpenNext, packages/web/wrangler.jsonc) with ISR. The
# `cloudflare_pages_domain` bindings that used to attach web/web-staging
# custom domains to these projects were removed so the worker can attach the
# same domains via its `routes` (custom_domain: true) on `wrangler deploy`.
# The Pages projects are kept for instant rollback: to roll back, re-add the
# pages domain + DNS record and remove the worker route.
resource "cloudflare_pages_project" "web" {
  account_id        = var.cloudflare_account_id
  name              = var.pages_project_name
  production_branch = "main"

  build_config {
    build_command   = "npm run build -w packages/web"
    destination_dir = "packages/web/dist"
    root_dir        = "/"
  }

  deployment_configs {
    production {
      environment_variables = {
        CMS_API_URL                            = "https://${local.cms_domain}"
        NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMS    = "true"
        NEXT_PUBLIC_CMS_IMAGE_TRANSFORM_ORIGIN = "https://${local.media_domain}"
      }
    }
  }
}

resource "cloudflare_pages_project" "web_staging" {
  account_id        = var.cloudflare_account_id
  name              = var.pages_staging_project_name
  production_branch = "main"

  build_config {
    build_command   = "npm run build -w packages/web"
    destination_dir = "packages/web/dist"
    root_dir        = "/"
  }

  deployment_configs {
    production {
      environment_variables = {
        CMS_API_URL                            = "https://${local.cms_staging_domain}"
        NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMS    = "true"
        NEXT_PUBLIC_CMS_IMAGE_TRANSFORM_ORIGIN = "https://${local.media_staging_domain}"
      }
    }
  }
}
