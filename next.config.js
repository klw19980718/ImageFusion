const nextIntl = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {};

// 指向我们已经创建好的配置文件
const withNextIntl = nextIntl('./src/i18n/request.ts');

module.exports = withNextIntl(nextConfig); 