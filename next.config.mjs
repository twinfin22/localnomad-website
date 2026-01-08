/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.replit.dev', '*.picard.replit.dev', '127.0.0.1:5000', 'localhost:5000'],
}

export default nextConfig
