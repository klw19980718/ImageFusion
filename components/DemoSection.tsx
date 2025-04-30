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
                {/* <div className="absolute top-1/2 left-1/4 -translate-y-1/2 z-10">
                  <div className="bg-[#00b894] text-black p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                  </div>
                </div> */}
                {/* <div className="flex items-center">
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
                </div> */}
              </div>

              {/* 合成结果 */}
              <div className="relative">
                <img
                  src="/demo.webp"
                  alt={t('conceptArt.title') + ' - Example of AI Image Fusion for combining images'}
                  className="w-full rounded-lg shadow-lg object-cover"
                />
                {/* <div className="absolute bottom-5 left-5 bg-[#00b894] text-black px-5 py-2 rounded-full font-medium shadow-lg">
                  <span>{t('generate')}</span>
                </div> */}
              </div>

              {/* 箭头 */}
              {/* <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 40C30 25 55 20 70 40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div> */}
            </div>
          </div>
          <div className="md:w-1/2 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">{t('conceptArt.title')}</h3>
            <p className="text-gray-300 leading-relaxed">
              {t('conceptArt.description')}
            </p>
          </div>
        </div>

        {/* 第二个示例：个人形象提升 (原产品品牌) */}
        <div className="mb-32 flex flex-col md:flex-row items-center gap-12">
          {/* 文字容器 */}
          <div className="md:w-1/2 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">{t('productBranding.title')}</h3>
            <p className="text-gray-300 leading-relaxed">
              {t('productBranding.description')}
            </p>
          </div>
          {/* 图片容器 (替换原有三张图片布局) */}
          <div className="md:w-1/2 relative">
            <img
              src="/person.webp"
              alt={t('productBranding.title') + ' - Enhance Images with AI Photo Fusion'}
              className="w-full rounded-lg shadow-lg object-cover max-h-[600px]"
            />
          </div>

        </div>

        <div className="mb-24 flex flex-col md:flex-row items-center gap-12">
          {/* 图片容器 - 响应式处理 */}
          <div className="w-full md:w-1/2 relative">
            {/* --- 桌面端布局 (md 及以上) --- */}
            <div className="hidden md:block">
              {/* 结果照片 - 居中 */}
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src="/images/templates/Future Vivid Fashion/result.jpg"
                  alt={`AI Photo Fusion Result - Merged photo from AI Image Blender - ${t('portraitEnhancement.title')}`}
                  className="block w-full rounded-lg shadow-lg object-cover"
                />
                <div className="absolute bottom-5 left-5 bg-[#00b894] text-black px-5 py-2 rounded-full font-medium shadow-lg z-10">
                  <span>{t('generate')}</span>
                </div>
              </div>
              {/* 原始照片 - 绝对定位左上角 */}
              <div className="absolute top-4 left-4 z-10 w-40 h-40">
                <img
                  src="/images/templates/Future Vivid Fashion/source.jpg"
                  alt={`Source portrait for AI Photo Enhancer - Input for Image Combiner`}
                  className="w-full h-full rounded-lg shadow-lg object-cover border-4 border-white"
                />
              </div>
              {/* 风格照片 - 绝对定位在原始照片下方 */}
              <div className="absolute top-[11.5rem] left-4 z-10 w-40 h-40">
                <img
                  src="/images/templates/Future Vivid Fashion/style.jpg"
                  alt={`Style image for AI Image Blender - Style Transfer Fusion`}
                  className="w-full h-full rounded-lg shadow-lg object-cover border-4 border-white"
                />
                <div className="absolute -top-3 -left-3 bg-[#00b894] text-black p-1 rounded-full font-medium shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                </div>
              </div>
            </div>
            {/* --- END 桌面端布局 --- */}

            {/* --- 移动端布局 (md 以下) --- */}
            <div className="md:hidden flex flex-col items-center gap-4">
              {/* 结果照片 - 居中，限制宽度 */}
              <div className="relative w-full max-w-xs mx-auto"> 
                <img
                  src="/images/templates/Future Vivid Fashion/result.jpg"
                  alt={`Mobile AI Photo Fusion Result - Blend Pictures - ${t('portraitEnhancement.title')}`}
                  className="block w-full rounded-lg shadow-lg object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-[#00b894] text-black px-4 py-1 text-sm rounded-full font-medium shadow-lg z-10">
                  <span>{t('generate')}</span>
                </div>
              </div>
              {/* 原始和风格照片 - 水平排列，居中，缩小尺寸 */}
              <div className="flex justify-center items-center gap-4 mt-4">
                {/* 原始照片 */}
                <img
                  src="/images/templates/Future Vivid Fashion/source.jpg"
                  alt={`Mobile source image for AI Photo Enhancer`}
                  className="w-24 h-24 rounded-lg shadow-lg object-cover border-2 border-white"
                />
                {/* 风格照片带加号 */}
                <div className="relative w-24 h-24">
                  <img
                    src="/images/templates/Future Vivid Fashion/style.jpg"
                    alt={`Mobile style image for Image Combiner`}
                    className="w-full h-full rounded-lg shadow-lg object-cover border-2 border-white"
                  />
                  <div className="absolute -top-2 -left-2 bg-[#00b894] text-black p-1 rounded-full font-medium shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            {/* --- END 移动端布局 --- */}
          </div>
          
          {/* 文字描述部分 - 添加移动端上边距 */}
          <div className="w-full md:w-1/2 text-white mt-8 md:mt-0">
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