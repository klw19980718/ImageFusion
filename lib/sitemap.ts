import { MetadataRoute } from 'next';
import { serverCmsApi } from './server-api';

// !!! IMPORTANT: Replace with your actual production domain !!!
// You can use environment variables like process.env.NEXT_PUBLIC_SITE_URL
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusionai.com';

// 生成博客文章slug
function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
    .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages (relative to root)
  const staticPages = [
    '/',
    '/blog',
    '/terms',
    '/privacy'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];



  staticPages.forEach(page => {
    sitemapEntries.push({
      url: `${BASE_URL}${page === '/' ? '' : page}`, // Add locale prefix
      lastModified: new Date(),
      changeFrequency: page === '/' ? 'daily' : 'weekly',
      priority: page === '/' ? 1.0 : 0.8,
    });
  });

  // Get blog posts from API and add dynamic blog post URLs
  try {
    const blogResponse = await serverCmsApi.getBlogList(1, 100, 0);

    blogResponse.list.forEach(post => {
      const slug = generateSlug(post.title);
      sitemapEntries.push({
        url: `${BASE_URL}/blog/${slug}`, // Correct path structure with locale
        lastModified: new Date(post.updated_time * 1000), // Convert timestamp to Date
        changeFrequency: 'monthly',
        priority: 0.7,
      });

    });

    console.log(`Sitemap: Generated ${blogResponse.list.length} blog post URLs for each locale`);
  } catch (error) {
    console.error('Sitemap: Failed to fetch blog posts for sitemap:', error);
    // 继续生成没有博客文章的sitemap
  }

  // Note: This sitemap lists localized URLs for both English and Chinese
  // Search engines will rely on the <html lang="..."> attribute and hreflang tags
  // to understand the language of the crawled page.

  return sitemapEntries;
} 