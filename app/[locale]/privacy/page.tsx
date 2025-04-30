'use client';

import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  // 定义需要渲染的隐私政策部分及其对应的翻译键
  const sections = [
    { titleKey: 'collectTitle', contentKey: 'collectContent' },
    { titleKey: 'collectAutoTitle', contentKey: 'collectAutoContent' },
    { titleKey: 'cookiesTitle', contentKey: 'cookiesContent' },
    { titleKey: 'paymentTitle', contentKey: 'paymentContent' },
    { titleKey: 'notCollectTitle', contentKey: 'notCollectContent' },
    { titleKey: 'howUseTitle', contentKey: 'howUseContent' },
    { titleKey: 'dataSecurityTitle', contentKey: 'dataSecurityContent' },
    { titleKey: 'changesTitle', contentKey: 'changesContent' },
  ];

  return (
    // 主容器，设置背景和内边距
    <main className="flex-grow py-16 px-6 bg-black text-white">
      <div className="container mx-auto max-w-4xl"> {/* 限制最大宽度 */} 
        {/* 内容卡片 */}
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 border border-[#FFD700]/20 shadow-lg">
          {/* 主标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#FFD700]">
            {t('title')}
          </h1>
          {/* 生效日期 */}
          <p className="text-center text-sm text-gray-400 mb-10">
            {t('effectiveDate')}
          </p>
          
          {/* 引言段落 */}
          <p className="mb-10 text-gray-300 leading-relaxed">
            {t('introduction')}
          </p>

          {/* 循环渲染各个隐私政策部分 */}
          {sections.map((section, index) => (
            <section key={index} className="mb-8">
              {/* 章节标题 */}
              <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-100">
                {/* 注意：隐私政策的标题通常不带序号 */}
                {t(section.titleKey as any)} 
              </h2>
              {/* 章节内容 - 使用 whitespace-pre-line 保留换行 */}
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {t(section.contentKey as any)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
} 