'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import Image from 'next/image';

export default function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const params = useParams();
  const currentLocale = params.locale as string || 'zh';
  const isZh = currentLocale === 'zh';

  // 用户评价数据 - 添加 avatar 字段
  const testimonials = [
    {
      name: 'Sarah Chen',
      location: 'New York',
      role: 'Digital Artist',
      content: 'ImageFusion has revolutionized my workflow. What used to take hours in Photoshop can now be done in minutes with even better results.',
      contentZh: '图像融合彻底改变了我的工作流程。以前在Photoshop中需要几小时的工作，现在只需几分钟就能完成，而且效果更好。',
      rating: 5,
      avatar: '/ava/u1.png' // 添加头像路径
    },
    {
      name: 'Michael Rodriguez',
      location: 'California',
      role: 'Marketing Director',
      content: 'We use ImageFusion for all our product marketing materials now. The AI fusion technology creates unique, eye-catching visuals that really stand out.',
      contentZh: '我们现在所有产品营销材料都使用图像融合。AI融合技术创造了独特、吸引人的视觉效果，让产品真正脱颖而出。',
      rating: 5,
      avatar: '/ava/u2.png' // 添加头像路径
    },
    {
      name: 'Emma Thompson',
      location: 'London',
      role: 'Photographer',
      content: 'The quality of the image fusion is incredible. It preserves all the important details while seamlessly blending different styles. Absolutely love it!',
      contentZh: '图像融合的质量令人难以置信。它保留了所有重要细节，同时无缝混合不同风格。我绝对喜欢它！',
      rating: 5,
      avatar: '/ava/u3.png' // 添加头像路径
    },
    {
      name: 'David Wilson',
      location: 'Toronto',
      role: 'UX Designer',
      content: 'This tool has become essential for my design presentations. Clients are amazed by the professional quality of the visuals we can create so quickly.',
      contentZh: '这个工具已成为我设计演示的必备工具。客户对我们能如此快速创建的专业质量视觉效果感到惊讶。',
      rating: 4,
      avatar: '/ava/u4.png' // 添加头像路径
    },
    {
      name: 'Jennifer Lopez',
      location: 'Miami',
      role: 'Content Creator',
      content: 'I create content for multiple platforms daily, and ImageFusion has cut my image creation time in half. The results are consistently stunning.',
      contentZh: '我每天为多个平台创建内容，ImageFusion将我的图像创建时间缩短了一半。效果始终令人惊艳。',
      rating: 5,
      avatar: '/ava/u5.png' // 添加头像路径
    },
    {
      name: 'Robert Chen',
      location: 'Singapore',
      role: 'E-commerce Manager',
      content: 'Our product photos look so much better with ImageFusion. We\'ve seen a 30% increase in conversion since we started using these enhanced images.',
      contentZh: '使用ImageFusion后，我们的产品照片看起来好多了。自从使用这些增强图像以来，我们的转化率提高了30%。',
      rating: 5,
      avatar: '/ava/u6.png' // 添加头像路径
    }
  ];

  // 获取翻译后的角色名称
  const getTranslatedRole = (role: string) => {
    const roleTranslations: {[key: string]: string} = {
      'Digital Artist': '数字艺术家',
      'Marketing Director': '营销总监',
      'Photographer': '摄影师',
      'UX Designer': 'UX设计师',
      'Content Creator': '内容创作者',
      'E-commerce Manager': '电商经理'
    };
    
    return isZh && roleTranslations[role] ? roleTranslations[role] : role;
  };

  return (
    <div className="py-20 px-6 bg-black text-white" id="testimonials">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          {t('title')}
        </h2>
        <p className="text-center text-gray-300 mb-16">
          {t('joinCommunity')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => {
            const translatedRole = getTranslatedRole(testimonial.role);
            
            return (
              <div 
                key={index}
                className="bg-[#161616] p-6 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image
                      src={testimonial.avatar}
                      alt={`Avatar for ${testimonial.name}`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {testimonial.location} | {isZh ? translatedRole : testimonial.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-700'}`}
                      fill={i < testimonial.rating ? "#FACC15" : "#374151"}
                      strokeWidth={0}
                    />
                  ))}
                </div>

                <p className="text-gray-300 text-sm">
                  "{isZh ? testimonial.contentZh : testimonial.content}"
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 