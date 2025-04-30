import ClientProviders from './ClientProviders';
import ClerkProviderWithLocale from '../../components/auth/clerk-provider';
import type { Metadata } from 'next';

// 使用固定值，与 app/layout.tsx 保持一致
const BASE_URL = 'www.imagefusionai.com'; 

export function generateStaticParams() {
  return [{ locale: 'en' }];
}

// 提供与根布局一致的 SEO 优化元数据
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  // 注意: params.locale 在这里实际未使用，因为我们已固定为 'en'
  return {
    title: 'AI Image Fusion Tool | Free Online Photo Combiner & Enhancer',
    description: 'AI Image Fusion: Combine images online effortlessly. Our powerful tool uses AI to intelligently merge your photos, enhancing detail and creating seamless results. Free and easy image combination awaits!',
    keywords: ['AI Image Fusion', 'Image Fusion Tool', 'Online Image Fusion', 'AI Photo Fusion', 'Free Image Fusion', 'Combine Images', 'Merge Photos', 'Blend Pictures', 'Image Combiner', 'Image Blender', 'Photo Merger', 'AI Photo Enhancer', 'Enhance Images'],
    alternates: {
      canonical: '/en', // Use relative path
      languages: {
        'en': '/en', // Use relative path
        'x-default': '/en', // Use relative path
      },
    },
    openGraph: {
      title: 'AI Image Fusion Tool | Free Online Photo Combiner & Enhancer',
      description: 'AI Image Fusion: Combine images online effortlessly. Our powerful tool uses AI to intelligently merge your photos, enhancing detail and creating seamless results. Free and easy image combination awaits!',
      url: '/en', // Use relative path for the English version
      siteName: 'ImageFusion',
      images: [
        {
          url: '/og-img.png', // Use relative path
          width: 1200,
          height: 630,
          alt: 'AI Image Fusion Tool - Combine and Enhance Photos with AI',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Image Fusion Tool | Free Online Photo Combiner & Enhancer',
      description: 'AI Image Fusion: Combine images online effortlessly. Our powerful tool uses AI to intelligently merge your photos, enhancing detail and creating seamless results. Free and easy image combination awaits!',
      images: ['/og-img.png'], // Use relative path
      // creator: '@yourTwitterHandle', // 可选
    },
    // verification: { ... }, // 可选
    // icons: { ... }, // 可选
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = 'en'; // 固定为英文
  
  // 动态导入消息文件并进行错误处理
  let messages;
  try {
    const userModule = await import(`../../messages/en.json`);
    messages = userModule.default;
  } catch (error) {
    console.error(`Failed to load messages for en:`, error);
    messages = {};
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