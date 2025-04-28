'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ExampleImage {
  original: string;
  generated: string;
  alt: string;
}

export default function ComparisonSlider() {
  const t = useTranslations('examples');
  
  const exampleImages: ExampleImage[] = [
    {
      original: '/examples/b1.png',
      generated: '/examples/a1.png',
      alt: '示例图片1'
    },
    {
      original: '/examples/b2.png',
      generated: '/examples/a2.jpg',
      alt: '示例图片2'
    },
    {
      original: '/examples/b3.png',
      generated: '/examples/a3.png',
      alt: '示例图片3'
    }
  ];
  
  return (
    <section id="examples" className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-foreground">
          {t('title')}
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          {t('description')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {exampleImages.map((image, index) => (
            <SingleComparison key={index} image={image} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SingleComparison({ image }: { image: ExampleImage }) {
  const t = useTranslations('examples');
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100, representing percentage from LEFT
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
  };
  
  const handleMove = (clientX: number) => {
    if (isDragging.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const position = ((clientX - containerRect.left) / containerWidth) * 100;
      
      setSliderPosition(Math.min(Math.max(position, 0), 100));
    }
  };
  
  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
        if (isDragging.current) {
            handleMove(e.clientX);
        }
    };

    const handleTouchMoveGlobal = (e: TouchEvent) => {
        if (isDragging.current) {
            e.preventDefault();
            handleMove(e.touches[0].clientX);
        }
    };

    const handleMouseUpGlobal = () => {
      if (isDragging.current) {
           isDragging.current = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('touchend', handleMouseUpGlobal);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('touchmove', handleTouchMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('touchend', handleMouseUpGlobal);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[2/3] overflow-hidden rounded-standard shadow-custom select-none hover-scale"
    >
      {/* 原始图片 (底层) */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full">
          <Image 
            src={image.original} 
            alt={`${image.alt} (${t('originalLabel')})`}
            fill
            className="object-cover pointer-events-none"
            priority
          />
        </div>
      </div>
      
      {/* 生成的图片（上层，根据滑块位置裁剪） */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        {/* 内部图片宽度调整以适应裁剪 */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ width: sliderPosition > 0 ? `${100 / (sliderPosition / 100)}%` : '0%' }}
        >
          <Image 
            src={image.generated} 
            alt={`${image.alt} (${t('generatedLabel')})`}
            fill 
            className="object-cover pointer-events-none"
            priority
          />
        </div>
      </div>
      
      {/* 滑块控制条 (垂直) - 增大可交互区域 */}
      <div
        className="absolute top-0 bottom-0 cursor-ew-resize z-10 flex items-center justify-center w-15" 
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }} 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 滑块按钮 (保持不变，它会在加宽的透明父级中居中) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary shadow-md flex items-center justify-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>
      </div>
      
      {/* 标签 (调整位置) */}
      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium pointer-events-none z-20">
        {t('generatedLabel')} 
      </div>
      <div className="absolute top-4 right-4 bg-muted text-foreground px-3 py-1 rounded-full text-sm font-medium pointer-events-none z-20">
        {t('originalLabel')}
      </div>
    </div>
  );
} 