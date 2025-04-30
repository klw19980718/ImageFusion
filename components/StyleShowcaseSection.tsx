'use client';

import { useTranslations } from 'next-intl';
import imgFusionTemplates from '@/app/config/templates';
import Image from 'next/image';

export default function StyleShowcaseSection() {
  const t = useTranslations('home');
  
  return (
    <div className="py-16 px-6 bg-[#051525] text-white scroll-mt-20" id="showcase">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 pt-4">
          {t('styleShowcase.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {imgFusionTemplates.slice(0, 4).map((template, index) => (
            <div 
              key={index} 
              className="relative h-[400px] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* 结果图 - 填充整个卡片 */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={template.demo.resultImageSrc}
                  alt={template.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>
              </div>
              
              {/* 原图和风格图 - 悬浮在结果图底部 */}
              <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center space-x-4 px-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden border border-white/60 shadow-lg">
                  <Image
                    src={template.demo.sourceImageSrc}
                    alt={`${template.name} 原图`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                
                <div className="relative w-20 h-20 rounded-md overflow-hidden border border-white/60 shadow-lg">
                  <Image
                    src={template.imageSrc}
                    alt={`${template.name} 风格`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 