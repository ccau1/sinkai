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

# ISR incremental cache for the web worker (prerendered pages + fetch data).
# Bound as NEXT_INC_CACHE_R2_BUCKET in packages/web/wrangler.jsonc.
resource "cloudflare_r2_bucket" "web_cache_prod" {
  account_id = var.cloudflare_account_id
  name       = "sinkai-web-cache-prod"
  location   = "APAC"
}

resource "cloudflare_r2_bucket" "web_cache_staging" {
  account_id = var.cloudflare_account_id
  name       = "sinkai-web-cache-staging"
  location   = "APAC"
}

# NOTE: `cloudflare_r2_custom_domain` does not exist in Cloudflare provider v4
# (it was introduced in provider v5). Until the provider is upgraded, the
# custom domains are attached via the Cloudflare API using local-exec
# provisioners. This requires `curl` on the machine running Terraform and an
# API token with Account R2 (Edit) permission.
#
# Because a resource with a destroy-time provisioner may not reference `var.*`
# from ANY of its provisioners, the token must be exported in the shell for
# both apply and destroy (it is never persisted in state):
#   export CLOUDFLARE_API_TOKEN=...
# (This is the same token as var.cloudflare_api_token / TF_VAR_cloudflare_api_token.)
resource "terraform_data" "cms_media_custom_domain_prod" {
  input = {
    account_id  = var.cloudflare_account_id
    bucket_name = cloudflare_r2_bucket.cms_media_prod.name
    domain      = local.media_domain
    zone_id     = var.cloudflare_zone_id
  }

  provisioner "local-exec" {
    command = <<-EOT
      response=$(curl -sS -X POST \
        "https://api.cloudflare.com/client/v4/accounts/${self.input.account_id}/r2/buckets/${self.input.bucket_name}/domains/custom" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"domain":"${self.input.domain}","zoneId":"${self.input.zone_id}","enabled":true}')
      echo "$response"
      echo "$response" | grep -q '"success":true'
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      response=$(curl -sS -X DELETE \
        "https://api.cloudflare.com/client/v4/accounts/${self.input.account_id}/r2/buckets/${self.input.bucket_name}/domains/custom/${self.input.domain}" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")
      echo "$response"
      echo "$response" | grep -q '"success":true'
    EOT
  }
}

resource "terraform_data" "cms_media_custom_domain_staging" {
  input = {
    account_id  = var.cloudflare_account_id
    bucket_name = cloudflare_r2_bucket.cms_media_staging.name
    domain      = local.media_staging_domain
    zone_id     = var.cloudflare_zone_id
  }

  provisioner "local-exec" {
    command = <<-EOT
      response=$(curl -sS -X POST \
        "https://api.cloudflare.com/client/v4/accounts/${self.input.account_id}/r2/buckets/${self.input.bucket_name}/domains/custom" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"domain":"${self.input.domain}","zoneId":"${self.input.zone_id}","enabled":true}')
      echo "$response"
      echo "$response" | grep -q '"success":true'
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      response=$(curl -sS -X DELETE \
        "https://api.cloudflare.com/client/v4/accounts/${self.input.account_id}/r2/buckets/${self.input.bucket_name}/domains/custom/${self.input.domain}" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")
      echo "$response"
      echo "$response" | grep -q '"success":true'
    EOT
  }
}
