'use client';

import { useTranslations } from 'next-intl';

export default function DemoSection() {
  const t = useTranslations('demo');

  return (
    <div className="py-20 px-6 bg-[#051525]">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
          {t('title')}
        </h2>

        {/* 第一个示例：概念艺术 */}
        <div className="mb-32 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 relative">
            <div className="relative">
              {/* 创意合成组件 */}
              <div className="relative mb-5">
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 z-10">
                  <div className="bg-[#00b894] text-black p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                  </div>
                </div>
                <div className="flex items-center">
                  <img
                    src="https://picsum.photos/200/300?random=1"
                    alt="原始图片1"
                    className="w-32 h-32 rounded-lg shadow-lg object-cover"
                  />
                  <img
                    src="https://picsum.photos/200/300?random=2"
                    alt="原始图片2"
                    className="w-32 h-32 rounded-lg shadow-lg object-cover ml-3"
                  />
                </div>
              </div>
              
              {/* 合成结果 */}
              <div className="relative ml-12">
                <img
                  src="https://picsum.photos/600/400?random=3"
                  alt="合成结果"
                  className="w-full rounded-lg shadow-lg object-cover"
                />
                <div className="absolute bottom-5 left-5 bg-[#00b894] text-black px-5 py-2 rounded-full font-medium shadow-lg">
                  <span>{t('generate')}</span>
                </div>
              </div>
              
              {/* 箭头 */}
              <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 40C30 25 55 20 70 40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">{t('conceptArt.title')}</h3>
            <p className="text-gray-300 leading-relaxed">
              {t('conceptArt.description')}
            </p>
          </div>
        </div>

        {/* 第二个示例：产品品牌 */}
        <div className="mb-32 flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">{t('productBranding.title')}</h3>
            <p className="text-gray-300 leading-relaxed">
              {t('productBranding.description')}
            </p>
          </div>
          <div className="md:w-1/2 relative">
            {/* 产品图片布局 */}
            <div className="flex gap-4">
              {/* 第一组图片 */}
              <div className="flex-shrink-0 w-1/3">
                <img 
                  src="https://picsum.photos/200/400?random=4" 
                  alt="产品组1"
                  className="w-full h-[350px] rounded-lg object-cover"
                />
              </div>
              
              {/* 第二组图片 (中间组带加号) */}
              <div className="flex-shrink-0 w-1/3 relative">
                <img 
                  src="https://picsum.photos/200/400?random=5" 
                  alt="产品组2"
                  className="w-full h-[350px] rounded-lg object-cover"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00b894] text-black p-2 rounded-full font-medium shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                </div>
              </div>
              
              {/* 第三组图片 */}
              <div className="flex-shrink-0 w-1/3">
                <img 
                  src="https://picsum.photos/200/400?random=6" 
                  alt="产品组3"
                  className="w-full h-[350px] rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 第三个示例：肖像增强 */}
        <div className="mb-24 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 relative">
            <div className="relative">
              {/* 原始照片 */}
              <div className="absolute top-10 left-0 z-10 w-48 h-48">
                <img
                  src="https://picsum.photos/200/300?random=7"
                  alt="原始照片"
                  className="w-full h-full rounded-lg shadow-lg object-cover border-4 border-white"
                />
              </div>
              
              {/* 风格照片 */}
              <div className="absolute top-5 right-5 z-10 w-32 h-32">
                <img
                  src="https://picsum.photos/200/300?random=8"
                  alt="风格照片"
                  className="w-full h-full rounded-lg shadow-lg object-cover border-4 border-white"
                />
                <div className="absolute -top-3 -left-3 bg-[#00b894] text-black p-1 rounded-full font-medium shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                </div>
              </div>
              
              {/* 结果照片 */}
              <div className="mt-16 ml-20 relative">
                <img
                  src="https://picsum.photos/600/400?random=9"
                  alt="合成结果"
                  className="w-full rounded-lg shadow-lg object-cover"
                />
                <div className="absolute bottom-5 left-5 bg-[#00b894] text-black px-5 py-2 rounded-full font-medium shadow-lg">
                  <span>{t('generate')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">{t('portraitEnhancement.title')}</h3>
            <p className="text-gray-300 leading-relaxed">
              {t('portraitEnhancement.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 