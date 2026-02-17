import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  allowedDevOrigins: [
    "127.0.0.1:5000",
    "localhost:5000",
  ],
  async redirects() {
    return [
      // Legacy routes → Korea (301 permanent)
      {
        source: "/visa",
        destination: "/korea/visa",
        permanent: true,
      },
      {
        source: "/visa/find",
        destination: "/korea/visa/find",
        permanent: true,
      },
      {
        source: "/visa/start",
        destination: "/korea/visa/find",
        permanent: true,
      },
      {
        source: "/visa/quiz",
        destination: "/korea/visa/find",
        permanent: true,
      },
      {
        source: "/visa/compare",
        destination: "/korea/visa/compare",
        permanent: true,
      },
      {
        source: "/visa/checklist",
        destination: "/korea/visa/checklist",
        permanent: true,
      },
      {
        source: "/visa/checklist/:type",
        destination: "/korea/visa/checklist/:type",
        permanent: true,
      },
      {
        source: "/visa/dashboard",
        destination: "/korea/visa/dashboard",
        permanent: true,
      },
      {
        source: "/visa/:type",
        destination: "/korea/visa/:type",
        permanent: true,
      },
      {
        source: "/areas",
        destination: "/korea/areas",
        permanent: true,
      },
      {
        source: "/bundles",
        destination: "/korea/bundles",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
