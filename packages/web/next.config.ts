import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    CMS_API_URL: process.env.CMS_API_URL || '',
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
