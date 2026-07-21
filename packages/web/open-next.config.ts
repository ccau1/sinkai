import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache'

// R2 incremental cache is required for ISR (the default static-assets cache is
// read-only and cannot be revalidated). The D1 tag cache backs
// revalidatePath/revalidateTag used by /api/revalidate. Traffic is low, so the
// D1 tag cache is sufficient; a Durable Object queue is intentionally omitted
// (requires the Workers Paid plan) — time-based revalidation then happens
// inline on the first request after expiry.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1NextTagCache,
})
