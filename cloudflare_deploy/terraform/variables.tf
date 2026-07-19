variable "cloudflare_api_token" {
  description = "Cloudflare API token with permissions for Pages, Workers, D1, R2, and DNS."
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID."
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the domain."
  type        = string
}

variable "domain" {
  description = "Root domain for the public website."
  type        = string
  default     = "tribalorigin.com"
}

variable "web_subdomain" {
  description = "Subdomain for the production public website."
  type        = string
  default     = "sinkai"
}

variable "web_staging_subdomain" {
  description = "Subdomain for the staging public website."
  type        = string
  default     = "sinkai.staging"
}

variable "cms_subdomain" {
  description = "Subdomain for the production Payload CMS admin and API."
  type        = string
  default     = "sinkai-cms"
}

variable "cms_staging_subdomain" {
  description = "Subdomain for the staging Payload CMS admin and API."
  type        = string
  default     = "sinkai-cms.staging"
}

variable "media_subdomain" {
  description = "Subdomain for the production CMS media R2 custom domain."
  type        = string
  default     = "sinkai-cms-media"
}

variable "media_staging_subdomain" {
  description = "Subdomain for the staging CMS media R2 custom domain."
  type        = string
  default     = "sinkai-cms-media.staging"
}

variable "environment" {
  description = "Environment name (e.g. prod, staging)."
  type        = string
  default     = "prod"
}

variable "worker_name" {
  description = "Name of the Cloudflare Worker that runs the CMS."
  type        = string
  default     = "sinkai-cms"
}

variable "d1_database_name" {
  description = "Name of the D1 database for the CMS."
  type        = string
  default     = "sinkai-cms"
}

variable "r2_bucket_name" {
  description = "Name of the R2 bucket for CMS media uploads."
  type        = string
  default     = "sinkai-cms-media"
}

variable "pages_project_name" {
  description = "Name of the Cloudflare Pages project for the production public website."
  type        = string
  default     = "sinkai-web"
}

variable "pages_staging_project_name" {
  description = "Name of the Cloudflare Pages project for the staging public website."
  type        = string
  default     = "sinkai-web-staging"
}
