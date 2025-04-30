import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 创建国际化中间件实例
const intlMiddleware = createMiddleware({
  // 配置默认本地化信息
  defaultLocale: 'en',
  // 支持的本地化语言
  locales: ['en'],
  // 禁用浏览器语言检测
  localeDetection: false
});

// 自定义中间件函数
export default async function middleware(request: NextRequest) {
  // 如果访问的是根路径，重定向到英文版本
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }
  
  // 对于其他路径，使用next-intl的中间件处理
  return intlMiddleware(request);
}

// 配置匹配器
export const config = {
  // 匹配所有路径，除了这些路径
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
}; 