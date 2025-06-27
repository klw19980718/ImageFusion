import { serverCmsApi, type BlogPost } from '@/lib/server-api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// 生成博客文章slug
function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
    .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
}

// 格式化时间戳为可读日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
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

// 获取单篇博客文章
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const blogResponse = await serverCmsApi.getBlogList(1, 100, 0);
    
    // 通过比较slug来查找对应的文章
    const post = blogResponse.list.find(p => generateSlug(p.title) === slug);
    
    console.log('App Router: Successfully fetched blog post:', post?.title);
    return post || null;
  } catch (error) {
    console.error('App Router: Failed to fetch blog post:', error);
    return null;
  }
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-6 py-12 mt-16 max-w-4xl">
      <Link
        href={`/${locale}/blog`}
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Back to Blog
      </Link>
      
      <header className="mb-12">
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
        
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          {post.title}
        </h1>
        
        {/* Abstract */}
        {post.abstract && (
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {post.abstract}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-muted-foreground mb-6">
          <span>ImageFusion Team</span>
          <span>•</span>
          <span>{formatDate(post.created_time)}</span>
          <span>•</span>
          <span>{estimateReadingTime(post.content)}</span>
        </div>
        
        {/* Keywords/Tags */}
        {post.keywords && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Tags:</span>
            <div className="flex gap-2">
              {post.keywords.split(',').slice(0, 3).map((keyword, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        {/* Markdown内容渲染 */}
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-6 text-foreground" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-3 text-foreground" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
            p: ({node, ...props}) => <p className="text-muted-foreground mb-4 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="text-muted-foreground" {...props} />,
            a: ({node, href, ...props}) => {
              const isExternal = href?.startsWith('http');
              return (
                <a 
                  href={href}
                  className="text-primary hover:underline transition-colors" 
                  {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
                  {...props} 
                />
              );
            },
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground bg-secondary/20" {...props} />,
            code: ({node, ...props}) => <code className="bg-secondary px-2 py-1 rounded text-sm font-mono" {...props} />,
            pre: ({node, ...props}) => <pre className="bg-secondary p-4 rounded-lg overflow-x-auto my-4" {...props} />,
            img: ({node, ...props}) => <img className="rounded-lg shadow-sm my-6 max-w-full h-auto" {...props} />,
            hr: ({node, ...props}) => <hr className="border-0 border-t border-gray-300 my-8" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
            em: ({node, ...props}) => <em className="italic" {...props} />,
            table: ({node, ...props}) => <table className="border-collapse border border-muted my-4 w-full" {...props} />,
            th: ({node, ...props}) => <th className="border border-muted bg-muted p-2 text-left font-semibold" {...props} />,
            td: ({node, ...props}) => <td className="border border-muted p-2" {...props} />,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}

// 生成静态参数
export async function generateStaticParams() {
  try {
    const blogResponse = await serverCmsApi.getBlogList(1, 100, 0);
    
    const params = [];
    const locales = ['en', 'zh'];
    
    for (const locale of locales) {
      for (const post of blogResponse.list) {
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