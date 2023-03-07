/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: 'https://thelindaprojectinc.github.io/Budget-Proposals/', // assetPrefix requires the trailing slash
  reactStrictMode: false,
  webpack: (config, {isServer}) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        net: false,
        tls: false,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
