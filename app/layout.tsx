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

// 定义元数据
const BASE_URL = 'https://www.imagefusion.com'; // 使用固定值

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'AI Image Fusion Tool | Free Online Photo Combiner & Enhancer',
  description: 'AI Image Fusion: Combine images online effortlessly. Our powerful tool uses AI to intelligently merge your photos, enhancing detail and creating seamless results. Free and easy image combination awaits!',
  keywords: ['AI Image Fusion', 'Image Fusion Tool', 'Online Image Fusion', 'AI Photo Fusion', 'Free Image Fusion', 'Combine Images', 'Merge Photos', 'Blend Pictures', 'Image Combiner', 'Image Blender', 'Photo Merger', 'AI Photo Enhancer', 'Enhance Images'],
  openGraph: {
    title: 'AI Image Fusion Tool | Free Online Photo Combiner & Enhancer',
    description: 'AI Image Fusion: Combine images online effortlessly. Our powerful tool uses AI to intelligently merge your photos, enhancing detail and creating seamless results. Free and easy image combination awaits!',
    url: BASE_URL,
    siteName: 'ImageFusion',
    images: [
      {
        url: `${BASE_URL}/og-img.png`,
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
    images: [`${BASE_URL}/og-img.png`],
    // 可选: 添加 Twitter 账号
    // creator: '@yourTwitterHandle',
  },
  // 可选: 添加其他元数据，如 robots.txt 指令、图标等
  // icons: {
  //   icon: '/favicon.ico',
  //   shortcut: '/favicon-16x16.png',
  //   apple: '/apple-touch-icon.png',
  // },
  // verification: {
  //   google: 'your-google-site-verification-code',
  //   other: {
  //     me: ['your-email@example.com', 'your-link'],
  //   },
  // },
};

// 定义 Organization 和 WebSite 的 Schema 结构化数据
function getSchemaData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "ImageFusion",
        "url": BASE_URL
      },
      {
        "@type": "WebSite",
        "name": "ImageFusion",
        "url": BASE_URL,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${BASE_URL}/search?q={search_term_string}`,
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
  const locale = 'en'; // 固定为英文
  const schemaData = getSchemaData();
  const GA_TRACKING_ID = 'G-3DB3HY13E2';

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
