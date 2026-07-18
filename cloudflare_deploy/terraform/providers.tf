terraform {
  required_version = ">= 1.5"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.52"
    }
  }

  # For production use, configure a remote backend such as S3, GCS, or Terraform Cloud.
  backend "local" {}
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
