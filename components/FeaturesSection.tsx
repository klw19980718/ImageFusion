'use client';

import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
  const t = useTranslations('features');

  const features = [
    {
      id: 'enhancedCreativity',
      title: t('features.enhancedCreativity.title'),
      description: t('features.enhancedCreativity.description')
    },
    {
      id: 'quickAndEasy',
      title: t('features.quickAndEasy.title'),
      description: t('features.quickAndEasy.description')
    },
    {
      id: 'highQualityResults',
      title: t('features.highQualityResults.title'),
      description: t('features.highQualityResults.description')
    },
    {
      id: 'styleFlexibility',
      title: t('features.styleFlexibility.title'),
      description: t('features.styleFlexibility.description')
    },
    {
      id: 'costEffective',
      title: t('features.costEffective.title'),
      description: t('features.costEffective.description')
    },
    {
      id: 'commercialReady',
      title: t('features.commercialReady.title'),
      description: t('features.commercialReady.description')
    }
  ];

  const steps = [
    {
      id: 'upload',
      title: t('steps.upload.title'),
      description: t('steps.upload.description')
    },
    {
      id: 'style',
      title: t('steps.style.title'),
      description: t('steps.style.description')
    },
    {
      id: 'results',
      title: t('steps.results.title'),
      description: t('steps.results.description')
    }
  ];

  return (
    <div className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        {/* Key Features */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            {t('title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.id} 
                className="bg-card p-8 rounded-standard shadow-custom border border-muted/20 hover:scale-[1.02] transition-transform duration-300"
              >
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            {t('howItWorksTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="bg-card p-8 rounded-standard shadow-custom border border-muted/20 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-primary font-bold text-xl">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 