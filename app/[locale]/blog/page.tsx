'use client';

import { useTranslations } from 'next-intl';
// import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { useState } from 'react';
// Remove Image import as it's no longer used in the list
// import Image from 'next/image'; 
import Link from 'next/link';
// 导入博客元数据
import { blogPostMetadata, BlogPostMeta } from '../../../lib/blogData'; 

export default function Blog() {
  const t = useTranslations('blog');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // 使用导入的元数据
  const allPostsMeta = blogPostMetadata; 

  // 根据活跃类别筛选博客文章元数据
  const filteredPostsMeta = activeCategory === 'all' 
    ? allPostsMeta 
    : allPostsMeta.filter(post => post.category === activeCategory);
  
  // 获取当前语言环境 (在客户端组件中获取)
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* <Navbar /> */}
      <main className="flex-grow py-12 px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold font-fredoka text-center mb-12">
            {t('title')}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 侧边栏 - 分类 */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-custom mb-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4">{t('categories')}</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg ${ // 使用 block 替代 w-full text-left?
                        activeCategory === 'all' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                      }`}
                    >
                      {t('allArticles')} {/* 使用翻译 */} 
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveCategory('updates')}
                      className={`w-full text-left px-3 py-2 rounded-lg ${ // 使用 block 替代 w-full text-left?
                        activeCategory === 'updates' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                      }`}
                    >
                      {t('updates')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveCategory('tutorials')}
                      className={`w-full text-left px-3 py-2 rounded-lg ${ // 使用 block 替代 w-full text-left?
                        activeCategory === 'tutorials' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                      }`}
                    >
                      {t('tutorials')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveCategory('stories')}
                      className={`w-full text-left px-3 py-2 rounded-lg ${ // 使用 block 替代 w-full text-left?
                        activeCategory === 'stories' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                      }`}
                    >
                      {t('stories')}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* 博客文章列表 - 修改为垂直列表 */}
            <div className="md:col-span-3">
              {/* 移除 grid，使用 space-y 控制间距 */}
              <div className="space-y-8">
                {/* 使用 filteredPostsMeta 进行迭代 */} 
                {filteredPostsMeta.map(post => (
                  // 更新 Link href 指向 /blog/[slug]
                  <Link 
                    href={`/${locale}/blog/${post.slug}`} 
                    key={post.id}
                    // 修改卡片样式，移除图片相关
                    className="block bg-white rounded-2xl p-6 shadow-custom hover:shadow-lg transition-shadow"
                  >
                    {/* 内容区调整 */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                        <span className="px-2 py-1 bg-primary/10 rounded-full text-xs text-primary font-medium">
                          {/* 使用 t() 直接翻译 category，并添加类型断言 */}
                          {t(post.category as 'updates' | 'tutorials' | 'stories')}
                        </span>
                      </div>
                      {/* 使用翻译函数获取 title */}
                      <h3 className="text-xl font-bold mb-2 text-foreground hover:text-primary transition-colors">{t(`posts.${post.slug}.title`)}</h3>
                      {/* 使用翻译函数获取 excerpt */}
                      <p className="text-muted-foreground line-clamp-3">{t(`posts.${post.slug}.excerpt`)}</p> 
                    </div>
                  </Link>
                ))} 
                {filteredPostsMeta.length === 0 && (
                  <p className="text-muted-foreground text-center">该分类下暂无文章。</p> // 添加无文章提示
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 