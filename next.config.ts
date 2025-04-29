import type { NextConfig } from "next";
import nextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        // port: '', // 可选
        // pathname: '/**', // 可选, 允许所有路径
      },
      {
        protocol: "https",
        hostname: "cf.framepola.com",
        port: "", // 通常不需要指定端口
        pathname: "/**", // 允许该域名下的所有路径
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "", // 通常不需要指定端口
        pathname: "/**", // 允许该域名下的所有路径
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cartoon.framepola.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

// 指向已经创建好的配置文件
const withNextIntl = nextIntl('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
