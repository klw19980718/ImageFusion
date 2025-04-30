import { MetadataRoute } from 'next';

// !!! IMPORTANT: Replace with your actual production domain !!!
// You can use environment variables like process.env.NEXT_PUBLIC_SITE_URL
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en']; // 支持的语言环境

  // 静态页面列表 (相对于根目录)
  const staticPages = [
    '/',
    '/blog',
    '/terms',
    '/privacy',
    // 如果有其他静态页面，在此添加 (例如 '/contact')
  ];

  // 从翻译文件中获取的博客文章 slugs (实际应用中可能需要从 API 或 CMS 获取)
  const blogPostSlugs = [
    'how-to-take-perfect-polaroid-style-photos',
    'new-feature-3d-effect-enhancement',
    'user-story-wedding-photos-to-creative-souvenirs',
    'history-and-charm-of-polaroid-style',
    '5-creative-ways-to-display-polaroid-photos',
    'performance-optimization-update-faster-processing'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];



  locales.forEach(locale => {
    // 添加静态页面的 URL
    staticPages.forEach(page => {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${page === '/' ? '' : page}`, // 构建特定语言环境的 URL
        lastModified: new Date(), // 为简单起见使用当前日期，理想情况下获取实际修改日期
        changeFrequency: page === '/' ? 'daily' : 'weekly', // 根据更新频率调整
        priority: page === '/' ? 1.0 : 0.8, // 首页优先级更高
      });
    });

    // --- 添加动态博客文章路由 ---
    blogPostSlugs.forEach(slug => {
      sitemapEntries.push({
        // 注意：路径是 /blog/post/[slug]，请根据实际路由调整
        url: `${BASE_URL}/${locale}/blog/post/${slug}`,
        lastModified: new Date(), // 理想情况下获取文章的实际修改日期
        changeFrequency: 'monthly', // 假设博客文章每月更新或检查
        priority: 0.7, // 博客文章的优先级
      });
    });

  });

  return sitemapEntries;
} 