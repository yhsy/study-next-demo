import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // 部分预渲染
  experimental: {
    ppr: 'incremental' // 允许您为特定路由采用 PPR。
  }
};

export default nextConfig;
