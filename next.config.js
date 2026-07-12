/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: '/princess-renovation-dashboard',
  assetPrefix: '/princess-renovation-dashboard/',
};
module.exports = nextConfig;