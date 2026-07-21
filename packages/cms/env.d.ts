import type { D1Database, Fetcher, R2Bucket } from '@cloudflare/workers-types'

declare global {
  interface CloudflareEnv {
    D1: D1Database
    R2: R2Bucket
    THUMBNAILS: Fetcher
    PAYLOAD_SECRET?: string
    MEDIA_PUBLIC_URL?: string
    // Shared secret for on-demand ISR revalidation of the web worker
    // (hooks/triggerWebRevalidate.ts -> POST {WEB_APP_URL}/api/revalidate).
    REVALIDATE_SECRET?: string
    WEB_APP_URL?: string
  }
}

export {}
