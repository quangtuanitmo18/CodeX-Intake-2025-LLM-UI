import NextBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const isCI = process.env.CI === 'true'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api-bigboy.duthanhduoc.com',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname: '164181.msk.web.highserver.ru',
        pathname: '/api-fastify/static/**',
      },
      {
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  productionBrowserSourceMaps: false,

  experimental: {},
  // Add the new turbopack configuration
  turbopack: {},
}

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
