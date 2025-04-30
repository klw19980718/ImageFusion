'use client';

import { useTranslations } from 'next-intl';
import { useParams, notFound, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react'; 
// 导入博客元数据
import { blogPostMetadata } from '../../../../lib/blogData'; 

// 移除组件内部硬编码的 blogPosts 数组
/*
const blogPosts = [...];
*/

export default function BlogPostPage() {
  const t = useTranslations('blog');
  const params = useParams();
  const pathname = usePathname();
  const locale = 'en'; // 固定为英文
  const slug = params.slug as string;

  // 根据 slug 查找文章元数据
  const postMeta = blogPostMetadata.find(p => p.slug === slug);

  // 如果文章元数据未找到，显示 404
  if (!postMeta) {
    notFound();
  }

  // 使用 t.raw 获取整个文章翻译对象
  const postTranslation = t.raw(`posts.${slug}`) as { title: string; excerpt: string; content: string; } | null | undefined;

  // 检查翻译是否存在且有效
  if (!postTranslation || typeof postTranslation.content !== 'string') {
    console.error(`Missing or invalid translation for posts.${slug}`);
    // Render an error or fallback - simplified here
    return (
      <main className="flex-grow py-12 px-6 bg-background">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-foreground mb-6">Error loading post content or translation missing.</p>
          <Link href={`/${locale}/blog`} className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2">
            <ArrowLeft size={16} /> {t('backToBlog')}
          </Link>
        </div>
      </main>
    );
  }

  // 从获取的对象中提取 title 和 content
  const postTitle = postTranslation.title;
  const postContent = postTranslation.content;

  // 获取翻译后的分类文本
  const categoryText = t(postMeta.category as 'updates' | 'tutorials' | 'stories');

  // 设置页面标题（利于SEO）
  useEffect(() => {
    document.title = `${postTitle} - ImageFusion Blog`;
  }, [postTitle]);

  return (
    <main className="flex-grow py-12 px-6 bg-background">
      <div className="container mx-auto max-w-3xl">
        {/* 返回链接 */}
        <Link 
          href={`/${locale}/blog`} 
          className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2 mb-8"
        >
          <ArrowLeft size={16} /> {t('backToBlog')}
        </Link>

        {/* 文章卡片 */}
        <div className="bg-card rounded-xl shadow-md overflow-hidden">
          {/* 文章头部 */}
          <div className="p-8 md:p-10 border-b border-border/40">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight">
              {postTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <time dateTime={postMeta.date} className="font-medium">
                {t('publishedOn')} {postMeta.date}
              </time>
              <span className="hidden md:inline text-muted-foreground/50">&bull;</span> 
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary">
                {categoryText}
              </span>
            </div>
          </div>

          {/* 文章内容 */}
          <div className="p-8 md:p-10">
            <article
              className="prose prose-slate prose-lg md:prose-xl max-w-none
                prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-10 prose-headings:mb-5
                prose-h2:text-2xl prose-h2:mt-12
                prose-h3:text-xl
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-li:text-muted-foreground
                prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:text-primary/80 hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-foreground
                prose-blockquote:border-primary/30 prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-md prose-blockquote:not-italic
                prose-img:rounded-lg prose-img:shadow-sm
                prose-code:text-primary-foreground prose-code:bg-primary/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-sm
                prose-pre:bg-muted"
              dangerouslySetInnerHTML={{ __html: postContent }}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 