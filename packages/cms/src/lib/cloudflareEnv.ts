import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'

let wranglerProxyEnv: Promise<CloudflareEnv> | undefined

/**
 * Resolve Cloudflare bindings at request time.
 *
 * Inside the OpenNext worker `getCloudflareContext` succeeds; in CLI/dev
 * contexts (`payload run`, tsx scripts) it throws, so we fall back to
 * wrangler's getPlatformProxy — mirroring payload.config.ts. The fallback
 * proxy is cached because creating it is expensive.
 */
export async function getCfEnv(): Promise<CloudflareEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    return env
  } catch {
    if (!wranglerProxyEnv) {
      wranglerProxyEnv = import(
        /* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`
      ).then(({ getPlatformProxy }) =>
        getPlatformProxy({
          environment: process.env.CLOUDFLARE_ENV,
          remoteBindings:
            process.env.NODE_ENV === 'production' && process.env.PAYLOAD_REMOTE === 'true',
          persist: process.env.PAYLOAD_PERSIST === 'false' ? false : true,
        } satisfies GetPlatformProxyOptions),
      ) as unknown as Promise<CloudflareEnv>
    }
    return wranglerProxyEnv
  }
}
