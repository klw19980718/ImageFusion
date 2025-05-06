import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en'];
const defaultLocale = 'en';

// 创建 next-intl 中间件实例 (后面调用)
const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localeDetection: false, // 已禁用
  localePrefix: 'as-needed' // 让默认语言 'en' 不需要前缀 (虽然我们下面会重写)
});

export default function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // --- Block Google indexing for clerk subdomain ---
  if (hostname === 'clerk.imagefusionai.com') {
    // Allow request to proceed but add the X-Robots-Tag header
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response; // Skip locale handling for this subdomain
  }
  // --- End block ---

  // 检查是否需要添加 /en 前缀进行内部重写
  // 1. 路径不是 API, _next, _vercel, 或包含点号 (静态文件)
  // 2. 路径不以 /en 开头
  const pathnameIsMissingLocale = 
    !pathname.startsWith(`/${defaultLocale}/`) && 
    !pathname.startsWith('/api') && 
    !pathname.startsWith('/_next') && 
    !pathname.startsWith('/_vercel') && 
    !pathname.includes('.');

  if (pathnameIsMissingLocale) {
    // 重写 URL，在内部添加 /en 前缀
    // 例如: /blog -> /en/blog
    // console.log(`Rewriting ${pathname} to /${defaultLocale}${pathname}`); // 调试信息 (可选)
    return NextResponse.rewrite(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  // 对于其他路径 (已经是 /en/... 或 API 等)，让 next-intl 处理
  // 注意：由于上面的重写，这里接收到的请求路径理论上都应该有 /en 前缀了
  return intlMiddleware(request);
}

// 配置匹配器 (保持不变)
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};