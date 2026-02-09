import type { Config } from 'next'

const config: Config = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@dfinity/agent', '@dfinity/candid', '@dfinity/principal'],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'utf-8-validate',
      'buffer': 'buffer',
    });
    return config;
  },
};

export default config;
