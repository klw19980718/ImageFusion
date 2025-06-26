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
    <main className="flex-grow container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          AI Image Fusion Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Tips, tutorials, and updates about AI image fusion, photo blending, and creative image combination techniques.
        </p>
      </div>

      {/* Blog Posts Grid */}
      {blogData.list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogData.list.map((post: BlogPost) => {
            const slug = generateSlug(post.title);
            
            return (
              <article key={post.id} className="bg-card border border-muted/30 rounded-standard p-6 hover:shadow-custom transition-standard">
                {/* Thumbnail if available */}
                {post.thumb && (
                  <div className="mb-4 aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={post.thumb} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Post Content */}
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/${locale}/blog/${slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.abstract || extractExcerpt(post.content)}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <time dateTime={new Date(post.created_time * 1000).toISOString()}>
                      {formatDate(post.created_time)}
                    </time>
                    
                    <Link 
                      href={`/${locale}/blog/${slug}`}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        // Fallback content when no blog posts are available
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Coming Soon
            </h2>
            <p className="text-muted-foreground">
              We're working on exciting blog content about AI image fusion techniques, tutorials, and tips. Check back soon!
            </p>
          </div>
        </div>
      )}
    </main>
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