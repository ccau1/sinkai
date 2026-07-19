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

resource "cloudflare_pages_domain" "web" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.web.name
  domain       = local.web_domain
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

resource "cloudflare_pages_domain" "web_staging" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.web_staging.name
  domain       = local.web_staging_domain
}
