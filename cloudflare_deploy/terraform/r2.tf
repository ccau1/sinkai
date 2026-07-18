resource "cloudflare_r2_bucket" "cms_media_prod" {
  account_id = var.cloudflare_account_id
  name       = "${var.r2_bucket_name}-prod"
  location   = "APAC"
}

resource "cloudflare_r2_bucket" "cms_media_staging" {
  account_id = var.cloudflare_account_id
  name       = "${var.r2_bucket_name}-staging"
  location   = "APAC"
}
