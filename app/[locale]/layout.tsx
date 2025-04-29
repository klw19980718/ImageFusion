import ClientProviders from './ClientProviders';
import ClerkProviderWithLocale from '../../components/auth/clerk-provider';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

// 根据不同语言提供不同的元数据
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = (await params).locale || 'zh';
  
  const metadata: Metadata = {
    alternates: {
      canonical: BASE_URL,
      languages: {
        'en': `${BASE_URL}/en`,
        'zh': `${BASE_URL}/zh`,
        'x-default': `${BASE_URL}/en`,
      },
    },
  };
  
  if (locale === 'en') {
    return {
      ...metadata,
      title: 'ImageFusion - Intelligent Image Fusion & Enhancement Platform',
      description: 'Use our AI-powered image fusion technology to seamlessly blend multiple images and create stunning visual effects. Easily achieve style transfer, image enhancement, and creative compositions.',
      keywords: ['image fusion', 'AI image processing', 'intelligent image composition', 'style transfer', 'image enhancement', 'creative image tools', 'high-quality image processing', 'visual art creation'],
      openGraph: {
        title: 'ImageFusion - Intelligent Image Fusion & Enhancement Platform',
        description: 'Use our AI-powered image fusion technology to seamlessly blend multiple images and create stunning visual effects. Easily achieve style transfer, image enhancement, and creative compositions.',
        url: BASE_URL,
        siteName: 'ImageFusion',
        images: [
          {
            url: `${BASE_URL}/og-img.png`,
            width: 1200,
            height: 630,
            alt: 'ImageFusion - Intelligent Image Fusion & Enhancement Platform Preview',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'ImageFusion - Intelligent Image Fusion & Enhancement Platform',
        description: 'Use our AI-powered image fusion technology to seamlessly blend multiple images and create stunning visual effects. Easily achieve style transfer, image enhancement, and creative compositions.',
        images: [`${BASE_URL}/og-img.png`],
      },
    };
  }
  
  // 默认使用中文
  return {
    ...metadata,
    title: 'ImageFusion - 智能图像融合与增强平台',
    description: '使用我们的AI驱动图像融合技术，将多种图像无缝融合，创造令人惊叹的视觉效果。轻松实现风格转换、图像增强和创意合成。',
    keywords: ['图像融合', 'AI图像处理', '智能图像合成', '风格转换', '图像增强', '创意图像工具', '高质量图像处理', '视觉艺术创作'],
    openGraph: {
      title: 'ImageFusion - 智能图像融合与增强平台',
      description: '使用我们的AI驱动图像融合技术，将多种图像无缝融合，创造令人惊叹的视觉效果。轻松实现风格转换、图像增强和创意合成。',
      url: BASE_URL,
      siteName: 'ImageFusion',
      images: [
        {
          url: `${BASE_URL}/og-img.png`,
          width: 1200,
          height: 630,
          alt: 'ImageFusion - 智能图像融合与增强平台预览',
        },
      ],
      locale: 'zh_CN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ImageFusion - 智能图像融合与增强平台',
      description: '使用我们的AI驱动图像融合技术，将多种图像无缝融合，创造令人惊叹的视觉效果。轻松实现风格转换、图像增强和创意合成。',
      images: [`${BASE_URL}/og-img.png`],
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = (await params).locale || 'zh';
  
  // 动态导入消息文件并进行错误处理
  let messages;
  try {
    const userModule = await import(`../../messages/${locale}.json`);
    messages = userModule.default;
  } catch (error) {
    console.error(`Failed to load messages for ${locale}:`, error);
    // 如果无法加载特定语言，尝试加载默认语言
    try {
      const defaultModule = await import(`../../messages/zh.json`);
      messages = defaultModule.default;
    } catch (fallbackError) {
      console.error(`Failed to load fallback messages:`, fallbackError);
      // 如果连默认语言也加载失败，提供一个最小的消息对象以避免应用崩溃
      messages = {};
    }
  }

  return (
    <ClientProviders locale={locale} messages={messages}>
      <ClerkProviderWithLocale>
        <main className="min-h-screen">
          {children}
        </main>
      </ClerkProviderWithLocale>
    </ClientProviders>
  )
} 