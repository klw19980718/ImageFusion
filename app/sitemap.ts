import { MetadataRoute } from 'next';

// 使用固定值或环境变量
const BASE_URL = 'https://www.imagefusionai.com'; 

export default function sitemap(): MetadataRoute.Sitemap {
  // const locales = ['en']; // 不再需要遍历 locale

  // 静态页面列表 (根相对路径)
  const staticPages = [
    '/',
    '/blog',
    '/terms',
    '/privacy',
  ];

  // 博客文章 slugs
  const blogPostSlugs = [
    'how-to-take-perfect-polaroid-style-photos',
    'new-feature-3d-effect-enhancement',
    'user-story-wedding-photos-to-creative-souvenirs',
    'history-and-charm-of-polaroid-style',
    '5-creative-ways-to-display-polaroid-photos',
    'performance-optimization-update-faster-processing'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 添加静态页面的 URL (不带 /en)
  staticPages.forEach(page => {
    sitemapEntries.push({
      url: `${BASE_URL}${page === '/' ? '' : page}`, // 直接拼接基础 URL 和页面路径
      lastModified: new Date(),
      changeFrequency: page === '/' ? 'daily' : 'weekly',
      priority: page === '/' ? 1.0 : 0.8,
    });
  });

  // 添加动态博客文章路由 (不带 /en)
  blogPostSlugs.forEach(slug => {
    sitemapEntries.push({
      // 确认你的博客文章路由是 /blog/[slug]
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: new Date(), 
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  return sitemapEntries;
}