'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
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
  
  return (
    <main className="flex-grow py-16 px-6 bg-black text-white">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#FFD700]">
          {t('title')}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 侧边栏 - 分类 */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-[#FFD700]/20 shadow-lg mb-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-[#FFD700]">{t('categories')}</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === 'all' ? 'bg-[#FFD700]/20 text-[#FFD700] font-medium' : 'text-white hover:bg-gray-800'
                    }`}
                  >
                    {t('allArticles')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCategory('updates')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === 'updates' ? 'bg-[#FFD700]/20 text-[#FFD700] font-medium' : 'text-white hover:bg-gray-800'
                    }`}
                  >
                    {t('updates')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCategory('tutorials')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === 'tutorials' ? 'bg-[#FFD700]/20 text-[#FFD700] font-medium' : 'text-white hover:bg-gray-800'
                    }`}
                  >
                    {t('tutorials')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCategory('stories')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === 'stories' ? 'bg-[#FFD700]/20 text-[#FFD700] font-medium' : 'text-white hover:bg-gray-800'
                    }`}
                  >
                    {t('stories')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* 博客文章列表 */}
          <div className="md:col-span-3">
            <div className="space-y-6">
              {filteredPostsMeta.map(post => (
                <Link 
                  href={`/blog/${post.slug}`}
                  key={post.id}
                  className="block bg-gray-900 rounded-2xl p-6 border border-[#FFD700]/20 shadow-lg hover:shadow-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-gray-400">{post.date}</span>
                      <span className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full text-xs text-[#FFD700] font-medium">
                        {t(post.category as 'updates' | 'tutorials' | 'stories')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white hover:text-[#FFD700] transition-colors">{t(`posts.${post.slug}.title`)}</h3>
                    <p className="text-gray-400 line-clamp-3">{t(`posts.${post.slug}.excerpt`)}</p> 
                  </div>
                </Link>
              ))} 
              {filteredPostsMeta.length === 0 && (
                <div className="text-center py-12 bg-gray-900 rounded-2xl border border-[#FFD700]/20">
                  <p className="text-gray-400">{t('noPosts', {defaultMessage: '该分类下暂无文章'})}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 