import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  outputFileTracingExcludes: {
    '*': ['./venv/**', './.venv/**'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    const taxSlugs = [
      'korea-double-tax-treaty-guide-2026',
      'korea-freelancer-tax-filing-guide-2026',
      'korea-5-year-rule-foreign-income-tax-2026',
      'korea-crypto-tax-2027-digital-nomads',
      '183-day-tax-trap-digital-nomads',
      'digital-nomad-tax-southeast-asia-2026',
      'leaving-korea-money-checklist-2026',
    ];
    const taxRedirects = taxSlugs.flatMap((slug) => [
      {
        source: `/:locale/blog/guides/${slug}`,
        destination: `/:locale/blog/tax/${slug}`,
        permanent: true,
      },
      {
        source: `/:locale/blog/tips/${slug}`,
        destination: `/:locale/blog/tax/${slug}`,
        permanent: true,
      },
    ]);
    return [
      {
        source: '/vi/:path*',
        destination: '/en/:path*',
        permanent: true,
      },
      ...taxRedirects,
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://events.mapbox.com https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://api.mapbox.com https://*.mapbox.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com",
              "font-src 'self'",
              "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://*.supabase.co https://discord.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com",
              "frame-src 'self'",
              "frame-ancestors 'self' https://*.notion.so https://*.notion.site",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
