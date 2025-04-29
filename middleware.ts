import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 创建国际化中间件实例
const intlMiddleware = createMiddleware({
  // 配置默认本地化信息
  defaultLocale: 'en',
  // 支持的本地化语言
  locales: ['zh', 'en'],
  // 启用浏览器语言检测
  localeDetection: true
});

// 自定义中间件函数，增强语言检测能力
export default async function middleware(request: NextRequest) {
  // 如果访问的是根路径，检查Accept-Language头部并明确重定向
  if (request.nextUrl.pathname === '/') {
    // 获取Accept-Language头部
    const acceptLanguage = request.headers.get('accept-language') || '';
    console.log('Accept-Language:', acceptLanguage); // 调试用
    
    // 检查是否优先包含英文
    const preferEnglish = /^en\b|,\s*en\b/.test(acceptLanguage);
    
    // 基于语言偏好重定向
    if (preferEnglish) {
      console.log('用户偏好英文，重定向到 /en'); // 调试用
      return NextResponse.redirect(new URL('/en', request.url));
    } else {
      console.log('用户偏好非英文，重定向到 /zh'); // 调试用
      return NextResponse.redirect(new URL('/zh', request.url));
    }
  }
  
  // 对于其他路径，使用next-intl的中间件处理
  return intlMiddleware(request);
}

// 配置匹配器
export const config = {
  // 匹配所有路径，除了这些路径
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
}; 