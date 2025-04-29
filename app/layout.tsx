import './globals.css'
import { Inter, Playfair_Display, Fredoka, Nunito, Baloo_2 } from 'next/font/google';
import type { Metadata } from 'next'
import Script from 'next/script';
import PaymentStatusModal from '@/components/payment-status-modal';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', weight: ['300', '400', '500', '600', '700'] });
const baloo = Baloo_2({ subsets: ['latin'], variable: '--font-baloo', weight: ['400', '500', '600', '700', '800'] });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', weight: ['200', '300', '400', '500', '600', '700', '800', '900'] });

// 根据不同语言提供不同的元数据
export const metadata: Metadata = {
  title: 'ImageFusion - 智能图像融合与增强平台',
  description: '使用我们的AI驱动图像融合技术，将多种图像无缝融合，创造令人惊叹的视觉效果。轻松实现风格转换、图像增强和创意合成。',
  keywords: ['图像融合', 'AI图像处理', '智能图像合成', '风格转换', '图像增强', '创意图像工具', '高质量图像处理', '视觉艺术创作'],
  openGraph: {
    title: 'ImageFusion - 智能图像融合与增强平台',
    description: '使用我们的AI驱动图像融合技术，将多种图像无缝融合，创造令人惊叹的视觉效果。轻松实现风格转换、图像增强和创意合成。',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com',
    siteName: 'ImageFusion',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com'}/og-img.png`,
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
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com'}/og-img.png`],
  },
}

// 定义 Organization 和 WebSite 的 Schema 结构化数据
function getSchemaData(locale: string) {
  locale = locale || 'zh';
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "ImageFusion",
        "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com'
      },
      {
        "@type": "WebSite",
        "name": "ImageFusion",
        "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com',
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusion.com'}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  // 由于我们不能在这里直接使用params，改为使用默认值
  const locale = 'zh'; // 默认使用中文
  const schemaData = getSchemaData(locale);
  const GA_TRACKING_ID = 'G-BST9KGD31X';

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${playfair.variable} ${fredoka.variable} ${baloo.variable} ${nunito.variable} bg-background text-foreground`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        {children}
        <Suspense fallback={null}>
          <PaymentStatusModal />
        </Suspense>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
