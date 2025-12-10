/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // Increase the limit to 10MB
    }
  }
};

export default nextConfig;