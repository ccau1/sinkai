resource "cloudflare_d1_database" "cms_prod" {
  account_id = var.cloudflare_account_id
  name       = "${var.d1_database_name}-prod"
}

resource "cloudflare_d1_database" "cms_staging" {
  account_id = var.cloudflare_account_id
  name       = "${var.d1_database_name}-staging"
}

# Tag cache for the web worker's on-demand ISR revalidation
# (revalidatePath via /api/revalidate). Bound as NEXT_TAG_CACHE_D1 in
# packages/web/wrangler.jsonc.
resource "cloudflare_d1_database" "web_tags_prod" {
  account_id = var.cloudflare_account_id
  name       = "sinkai-web-tags-prod"
}

resource "cloudflare_d1_database" "web_tags_staging" {
  account_id = var.cloudflare_account_id
  name       = "sinkai-web-tags-staging"
}
