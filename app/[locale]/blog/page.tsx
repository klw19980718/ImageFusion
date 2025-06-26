import { serverCmsApi, BlogPost } from '@/lib/server-api';
import Link from 'next/link';

// 生成博客文章slug
function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
    .replace(/^-+|-+$/g, '');
}

// 格式化时间戳
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 提取摘要
function extractExcerpt(content: string, maxLength: number = 150): string {
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  // 截取指定长度
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...'
    : plainText;
}

// 预估阅读时间
function estimateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // 移除HTML标签
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min`;
}

// 获取博客数据
async function getBlogData() {
  try {
    const blogData = await serverCmsApi.getBlogList(1, 20, 0);
    console.log('Blog page: Successfully fetched blog data:', blogData.list.length);
    return blogData;
  } catch (error) {
    console.error('Blog page: Failed to fetch blog data:', error);
    return { list: [], total: 0, total_page: 1 };
  }
}

export default async function BlogPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  
  // 获取数据
  const blogData = await getBlogData();

  if (!blogData || blogData.list.length === 0) {
    // 如果没有博客数据，可以显示空状态或回退到静态内容
    console.warn('No blog data available, consider adding fallback content');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-muted/20 to-primary/5 pt-20 pb-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent" style={{ lineHeight: '2' }}>
            AI Image Fusion Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tips, tutorials, and updates about AI image fusion, photo blending, and creative image combination techniques.
          </p>
        </div>
      </div>

      {/* Blog Posts Section */}
      <div className="container mx-auto px-6 py-16">
        {blogData.list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {blogData.list.map((post: BlogPost) => {
              const slug = generateSlug(post.title);
              
              return (
                <Link href={`/${locale}/blog/${slug}`} key={post.id}>
                  <article className="group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border overflow-hidden hover:-translate-y-2">
                    {/* Thumbnail if available */}
                    {post.thumb && (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img 
                          src={post.thumb} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    {/* Article Content */}
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                          Article
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-4 text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {post.title}
                      </h2>
                      
                      <p className="text-muted-foreground text-base mb-6 line-clamp-3 leading-relaxed">
                        {post.abstract || extractExcerpt(post.content)}
                      </p>
                      
                      {/* Article Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">IF</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">ImageFusion Team</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(post.created_time)} • {estimateReadingTime(post.content)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform duration-200">
                          <span className="text-sm font-medium">Read More</span>
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">No Blog Posts Yet</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We're working on creating amazing content about AI image fusion. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// App Router的ISR配置
export const revalidate = 3600; // 每小时重新验证一次

// 生成静态参数
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' }
  ];
} 