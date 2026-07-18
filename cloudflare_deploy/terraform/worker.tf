# The CMS Worker script is built and deployed by wrangler in CI.
# Wrangler also creates the route and DNS record for the CMS subdomain
# (configured in packages/cms/wrangler.jsonc via `routes` with `custom_domain: true`).
# Terraform does not manage the Worker script here because wrangler owns the
# build artifact and the custom-domain route.
