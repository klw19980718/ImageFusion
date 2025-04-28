'use client';

import { useTranslations } from 'next-intl';
import { useParams, notFound, usePathname } from 'next/navigation'; // 添加 usePathname
import Link from 'next/link';
import { Footer } from '../../../../components/Footer'; // 确认路径正确
import { useEffect } from 'react'; // 添加 useEffect
// 导入博客元数据
import { blogPostMetadata } from '../../../../lib/blogData'; 

// 移除组件内部硬编码的 blogPosts 数组
/*
const blogPosts = [...];
*/

export default function BlogPostPage() {
  const t = useTranslations('blog');
  const params = useParams();
  const pathname = usePathname(); // 获取完整路径
  const locale = params.locale as string;
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
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow py-12 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <p>Error loading post content or translation missing.</p>
            <Link href={`/${locale}/blog`} className="text-primary hover:underline mt-4 inline-block">
              &larr; {t('backToBlog')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 从获取的对象中提取 title 和 content
  const postTitle = postTranslation.title;
  const postContent = postTranslation.content;

  // 获取翻译后的分类文本
  const categoryText = t(postMeta.category as 'updates' | 'tutorials' | 'stories');

  // 设置页面标题（利于SEO）
  useEffect(() => {
    // 使用获取到的翻译标题
    document.title = `${postTitle} - PolaToons Blog`;
  }, [postTitle]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* <Navbar /> */}
      <main className="flex-grow py-12 px-6">
        {/* 优化容器样式：max-w-2xl */}
        <div className="container mx-auto max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-custom"> 
          {/* 返回链接 */}
          <Link href={`/${locale}/blog`} className="text-primary hover:underline mb-8 inline-block">
            &larr; {t('backToBlog')} 
          </Link>

          {/* 文章头部 */}
          <h1 className="text-3xl md:text-4xl font-bold font-fredoka mb-4 text-foreground">
            {postTitle} 
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8 border-b pb-4">
            {/* 使用 postMeta 中的 date */}
            <span>{t('publishedOn')} {postMeta.date}</span> 
            <span className="hidden md:inline">&bull;</span> 
            <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs text-primary font-medium">
              {categoryText} 
            </span>
          </div>

          {/* 文章内容 */}
          {/* 优化 prose 样式：移除 max-w-none, 调整 headings 边距 */}
          <article
            className="prose prose-slate prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:leading-relaxed prose-p:mb-5 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: postContent }} 
          />
        </div>
      </main>
      <Footer />
    </div>
  );
} 