/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! 警告：仅在开发过程中使用
    // 生产环境中应解决类型问题而不是忽略
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 