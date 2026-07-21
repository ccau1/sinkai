import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Standalone output is used by the local Docker setup (Node server) and is
  // also the input for the OpenNext Cloudflare build. The site is served with
  // ISR: pages are prerendered at build time, revalidated every 60s, and
  // revalidated on-demand by the CMS via /api/revalidate.
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    // CMS_API_URL is intentionally NOT inlined here: it is read from
    // process.env at runtime so ISR re-renders inside the worker (and the
    // local Docker server) use the runtime value. NEXT_PUBLIC_* values are
    // used by browser code and must be inlined at build time.
    NEXT_PUBLIC_CMS_API_URL: process.env.NEXT_PUBLIC_CMS_API_URL || '',
    NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMS:
      process.env.NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMS || '',
    NEXT_PUBLIC_CMS_IMAGE_TRANSFORM_ORIGIN:
      process.env.NEXT_PUBLIC_CMS_IMAGE_TRANSFORM_ORIGIN || '',
    NEXT_PUBLIC_IMAGE_PROXY_ORIGIN:
      process.env.NEXT_PUBLIC_IMAGE_PROXY_ORIGIN || '',
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
