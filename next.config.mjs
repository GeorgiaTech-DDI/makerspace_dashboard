/** @type {import('next') -NextConfig} */
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
};

export default nextConfig;
