resource "cloudflare_d1_database" "cms_prod" {
  account_id = var.cloudflare_account_id
  name       = "${var.d1_database_name}-prod"
}

resource "cloudflare_d1_database" "cms_staging" {
  account_id = var.cloudflare_account_id
  name       = "${var.d1_database_name}-staging"
}
