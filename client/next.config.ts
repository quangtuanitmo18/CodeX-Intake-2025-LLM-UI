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
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  output: 'standalone', // Use standalone for Docker
  productionBrowserSourceMaps: false,

  // Optimize bundle size
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Enable compression
  compress: true,

  // Optimize fonts
  optimizeFonts: true,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'react-markdown',
      'rehype-highlight',
      'remark-gfm',
    ],
  },
  // Add the new turbopack configuration
  turbopack: {},
}

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
