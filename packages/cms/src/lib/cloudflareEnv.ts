import fs from 'fs'
import path from 'path'
import { getCloudflareContext, type CloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'

let wranglerProxyEnv: Promise<CloudflareEnv> | undefined

const isCLI = process.argv.some((value) => {
  try {
    return fs.realpathSync(value).endsWith(path.join('payload', 'bin.js'))
  } catch {
    return false
  }
})

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Use wrangler's getPlatformProxy instead of the OpenNext worker context when
 * running in CLI/dev/script contexts or when explicitly targeting remote
 * bindings. This mirrors the logic in payload.config.ts and ensures R2,
 * THUMBNAILS, and other bindings are available in tsx scripts.
 */
function shouldUseWranglerProxy(): boolean {
  return (
    isCLI ||
    !isProduction ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.PAYLOAD_REMOTE === 'true'
  )
}

async function getWranglerProxyEnv(): Promise<CloudflareEnv> {
  if (!wranglerProxyEnv) {
    const { getPlatformProxy } = await import(
      /* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`
    )
    const proxy = (await getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      remoteBindings: isProduction && process.env.PAYLOAD_REMOTE === 'true',
      persist: process.env.PAYLOAD_PERSIST === 'false' ? false : true,
    } satisfies GetPlatformProxyOptions)) as CloudflareContext
    wranglerProxyEnv = Promise.resolve(proxy.env)
  }
  return wranglerProxyEnv
}

/**
 * Resolve Cloudflare bindings at request time.
 *
 * Inside the OpenNext worker `getCloudflareContext` succeeds; in CLI/dev
 * contexts (`payload run`, tsx scripts) it throws or returns a partial env,
 * so we fall back to wrangler's getPlatformProxy. The proxy is cached because
 * creating it is expensive.
 */
export async function getCfEnv(): Promise<CloudflareEnv> {
  if (shouldUseWranglerProxy()) {
    return getWranglerProxyEnv()
  }

  try {
    const { env } = await getCloudflareContext({ async: true })
    return env
  } catch {
    return getWranglerProxyEnv()
  }
}
