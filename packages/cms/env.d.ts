import type { D1Database, R2Bucket } from '@cloudflare/workers-types'

declare global {
  interface CloudflareEnv {
    D1: D1Database
    R2: R2Bucket
    PAYLOAD_SECRET?: string
  }
}

export {}
