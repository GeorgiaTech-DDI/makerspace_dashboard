/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 11 WARN 1!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // 11 WARN 1!
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-printer-session, x-sums-token' },
        ],
      },
    ];
  },
  // Add logging in production
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Optional: Configure image domains if you're using next/image
  images: {
    domains: [],
  },
  // Ensure we can use Node.js APIs in route handlers
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;