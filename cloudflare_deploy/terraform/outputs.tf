output "d1_database_id_prod" {
  description = "ID of the production D1 database. Add this to packages/cms/wrangler.jsonc under env.production."
  value       = cloudflare_d1_database.cms_prod.id
}

output "d1_database_id_staging" {
  description = "ID of the staging D1 database. Add this to packages/cms/wrangler.jsonc at the top level."
  value       = cloudflare_d1_database.cms_staging.id
}

output "d1_database_name_prod" {
  description = "Name of the production D1 database."
  value       = cloudflare_d1_database.cms_prod.name
}

output "d1_database_name_staging" {
  description = "Name of the staging D1 database."
  value       = cloudflare_d1_database.cms_staging.name
}

output "r2_bucket_name_prod" {
  description = "Name of the production R2 media bucket. Add this to packages/cms/wrangler.jsonc under env.production."
  value       = cloudflare_r2_bucket.cms_media_prod.name
}

output "r2_bucket_name_staging" {
  description = "Name of the staging R2 media bucket. Add this to packages/cms/wrangler.jsonc at the top level."
  value       = cloudflare_r2_bucket.cms_media_staging.name
}

output "pages_project_name_prod" {
  description = "Name of the production Cloudflare Pages project for the public website."
  value       = cloudflare_pages_project.web.name
}

output "pages_project_name_staging" {
  description = "Name of the staging Cloudflare Pages project for the public website."
  value       = cloudflare_pages_project.web_staging.name
}

output "web_domain_prod" {
  description = "Production domain where the public website is served."
  value       = local.web_domain
}

output "web_domain_staging" {
  description = "Staging domain where the public website is served."
  value       = local.web_staging_domain
}

output "cms_domain_prod" {
  description = "Production domain where the Payload CMS admin and API are served."
  value       = local.cms_domain
}

output "cms_domain_staging" {
  description = "Staging domain where the Payload CMS admin and API are served."
  value       = local.cms_staging_domain
}

output "media_domain_prod" {
  description = "Production R2 custom domain where public CMS media is served."
  value       = local.media_domain
}

output "media_domain_staging" {
  description = "Staging R2 custom domain where public CMS media is served."
  value       = local.media_staging_domain
}

output "next_steps" {
  description = "Manual steps after running Terraform."
  value       = <<EOT
1. Update packages/cms/wrangler.jsonc with:
   - Top-level D1 database_id: ${cloudflare_d1_database.cms_staging.id}
   - Top-level R2 bucket_name: ${cloudflare_r2_bucket.cms_media_staging.name}
   - env.production D1 database_id: ${cloudflare_d1_database.cms_prod.id}
   - env.production R2 bucket_name: ${cloudflare_r2_bucket.cms_media_prod.name}

2. Set GitHub secrets:
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_ACCOUNT_ID
   - CLOUDFLARE_ZONE_ID (for tribalorigin.com)
   - PAYLOAD_SECRET (used for both staging and prod Workers)
   - CMS_API_URL_PROD=https://${local.cms_domain}
   - CMS_API_URL_STAGING=https://${local.cms_staging_domain}

3. Merges to main will deploy to staging automatically.
   The production job requires approval via the GitHub "production" environment.

4. To deploy the CMS manually:
   cd packages/cms
   npm run deploy              # staging
   npm run deploy:production   # production
EOT
}
