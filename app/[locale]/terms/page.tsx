'use client';

import { useTranslations } from 'next-intl';
import { Footer } from '../../../components/Footer';
import PageLayout from '../page-layout';

export default function TermsOfServicePage() {
  const t = useTranslations('terms');

  // 定义需要渲染的条款部分及其对应的翻译键
  const sections = [
    { titleKey: 'acceptanceTitle', contentKey: 'acceptanceContent' },
    { titleKey: 'changesTitle', contentKey: 'changesContent' },
    { titleKey: 'useServiceTitle', contentKey: 'useServiceContent' },
    { titleKey: 'contentTitle', contentKey: 'contentContent' },
    { titleKey: 'disclaimersTitle', contentKey: 'disclaimersContent' },
    { titleKey: 'liabilityTitle', contentKey: 'liabilityContent' },
    { titleKey: 'generalTitle', contentKey: 'generalContent' },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow py-16 px-6 bg-black text-white">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-gray-900 rounded-2xl p-8 md:p-12 border border-[#FFD700]/20 shadow-lg">
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#FFD700]">
                {t('title')}
              </h1>
              <p className="text-center text-sm text-gray-400 mb-10">
                {t('effectiveDate')}
              </p>
              <p className="mb-10 text-gray-300 leading-relaxed">
                {t('introduction')}
              </p>

              {sections.map((section, index) => (
                <section key={index} className="mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-100">
                    {index + 1}. {t(section.titleKey as any)}
                  </h2>
                  <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                    {t(section.contentKey as any)}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageLayout>
  );
} 