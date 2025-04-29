'use client';

import { useTranslations } from 'next-intl';
import { Footer } from '../../../components/Footer';
import PageLayout from '../page-layout';

export default function TermsOfServicePage() {
  const t = useTranslations('terms');

  // 定义结构化内容
  const sections = [
    { key: 'acceptanceTitle', contentKey: 'acceptanceContent' },
    { key: 'changesTitle', contentKey: 'changesContent' },
    { key: 'useServiceTitle', contentKey: 'useServiceContent' },
    { key: 'contentTitle', contentKey: 'contentContent' },
    { key: 'disclaimersTitle', contentKey: 'disclaimersContent' },
    { key: 'liabilityTitle', contentKey: 'liabilityContent' },
    { key: 'generalTitle', contentKey: 'generalContent' },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow py-12 md:py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <article className="prose prose-xl lg:prose-2xl max-w-none dark:prose-invert bg-white p-8 md:p-12 rounded-2xl shadow-custom">
              <h1 className="text-center font-fredoka font-bold text-primary text-3xl md:text-4xl mb-4">{t('title')}</h1>
              <p className="text-center text-base text-muted-foreground mb-10">{t('effectiveDate')}</p>
              <p className="lead text-lg md:text-xl mb-8">{t('introduction')}</p>

              {sections.map((section, index) => (
                <section key={section.key} className="mt-10">
                  <h2 className="font-baloo font-semibold text-2xl md:text-3xl">{`${index + 1}. ${t(section.key)}`}</h2>
                  <div className="text-base md:text-lg text-muted-foreground space-y-4">
                    {t(section.contentKey).split('\n').map((paragraph, index) => (
                      paragraph.trim() && <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </PageLayout>
  );
} 