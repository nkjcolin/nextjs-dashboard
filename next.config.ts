import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.PUBLIC_IP!,
        process.env.AZURE_IP!,
      ],
    },
  },
    reactStrictMode: true,
};

export default nextConfig;
