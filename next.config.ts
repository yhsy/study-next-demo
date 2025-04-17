import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 部分预渲染(实验功能,canary版才支持:next@canary)
  // experimental: {
  //   ppr: 'incremental' // 允许您为特定路由采用 PPR。
  // }
};

export default nextConfig;
