import { withPayload } from '@payloadcms/next/withPayload'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

initOpenNextCloudflareForDev({
  persist: process.env.PAYLOAD_PERSIST === 'false' ? false : true,
  remoteBindings: false,
})

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const emptyOgShim = path.resolve(dirname, 'src/shims/empty-og.ts')

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],

  outputFileTracingExcludes: {
    '*': [
      '**/node_modules/next/dist/compiled/@vercel/og/**/*',
      '**/node_modules/sass/**/*',
      '**/node_modules/next/dist/compiled/next-devtools/**/*',
    ],
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve = webpackConfig.resolve ?? {}
    webpackConfig.resolve.extensionAlias = {
      ...(webpackConfig.resolve.extensionAlias ?? {}),
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias ?? {}),
      'next/dist/compiled/@vercel/og$': emptyOgShim,
      'next/dist/compiled/@vercel/og/index.node.js': emptyOgShim,
      'next/dist/compiled/@vercel/og/index.edge.js': emptyOgShim,
    }

    // Disable source maps in the production server bundle to reduce Worker size.
    webpackConfig.devtool = false

    return webpackConfig
  },
}

const analyzedConfig = process.env.ANALYZE === 'true' ? withBundleAnalyzer({ openAnalyzer: false })(nextConfig) : nextConfig

export default withPayload(analyzedConfig, { devBundleServerPackages: false })
