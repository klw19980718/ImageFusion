import { serverCmsApi, type BlogPost } from '@/lib/server-api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

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

// 预估阅读时间
function estimateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // 移除HTML标签
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min`;
}

// 根据slug查找博客文章
async function findBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const blogData = await serverCmsApi.getBlogList(1, 100, 0);
    
    const post = blogData.list.find(post => {
      const postSlug = generateSlug(post.title);
      return postSlug === slug;
    });
    
    return post || null;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { locale, slug } = await params;
  
  // 获取数据
  const post = await findBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex-grow">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          href={`/${locale}/blog`}
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          {/* Thumbnail if available */}
          {post.thumb && (
            <div className="mb-8 aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={post.thumb} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          
          {/* Abstract */}
          {post.abstract && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.abstract}
            </p>
          )}
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-muted/30 pb-6 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={new Date(post.created_time * 1000).toISOString()}>
                {formatDate(post.created_time)}
              </time>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{estimateReadingTime(post.content)} read</span>
            </div>
            
            {post.keywords && (
              <div className="flex items-center gap-2">
                <span>Tags:</span>
                <div className="flex gap-2">
                  {post.keywords.split(',').slice(0, 3).map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-muted rounded-full text-xs"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:text-foreground 
              prose-p:text-foreground prose-p:leading-relaxed
              prose-strong:text-foreground
              prose-a:text-primary hover:prose-a:text-primary/80
              prose-li:text-foreground
              prose-blockquote:text-muted-foreground prose-blockquote:border-primary
              prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>

      {/* Related Articles CTA */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Want to Learn More?
            </h3>
            <p className="text-muted-foreground mb-6">
              Discover more tutorials and tips about AI image fusion techniques.
            </p>
            <Link 
              href={`/${locale}/blog`}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// 生成静态参数
export async function generateStaticParams() {
  try {
    const blogData = await serverCmsApi.getBlogList(1, 100, 0);
    
    const params = [];
    const locales = ['en', 'zh'];
    
    for (const locale of locales) {
      for (const post of blogData.list) {
        params.push({
          locale,
          slug: generateSlug(post.title)
        });
      }
    }
    
    return params;
  } catch (error) {
    console.error('Failed to generate static params for blog posts:', error);
    return [];
  }
}

// App Router的ISR配置
export const revalidate = 3600; // 每小时重新验证一次 