/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'l00pz.tail4fa727.ts.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;