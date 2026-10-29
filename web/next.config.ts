import type { NextConfig } from 'next';
import { withYak } from '@yak/react/withYak';

const nextConfig: NextConfig = {
  // Component/function level caching: dynamic by default, static shell prerendered.
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer'],
  experimental: {
    // VAPT logs can be large; uploads go through route handlers, not server actions.
    serverActions: { bodySizeLimit: '25mb' },
    proxyClientMaxBodySize: '25mb',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default withYak({ prefix: 'aq' }, nextConfig);
