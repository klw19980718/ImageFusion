import createMiddleware from 'next-intl/middleware';

// 国际化中间件
export default createMiddleware({
  // 配置默认本地化信息
  defaultLocale: 'en',
  // 支持的本地化语言
  locales: ['zh', 'en'],
});

// 创建一个中间件处理程序
export const config = {
  // 匹配所有路径，除了这些路径
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 