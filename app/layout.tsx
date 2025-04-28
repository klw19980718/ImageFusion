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

export const metadata: Metadata = {
  title: 'PolaToons - Turn Photos into Polaroid-Style 3D Cartoons',
  description: 'Transform your photos into playful Polaroid-style 3D cartoons in seconds with our easy-to-use, AI-powered generator. Try it now!',
  keywords: ['Polaroid-style photos', '3D cartoon generator', 'AI photo transformation', 'vintage photo effects', 'instant photo generation', 'cartoon character creation', 'online photo editing', 'playful photo effects'],
  openGraph: {
    title: 'PolaToons - Turn Photos into Polaroid-Style 3D Cartoons',
    description: 'Transform your photos into playful Polaroid-style 3D cartoons in seconds with our easy-to-use, AI-powered generator. Try it now!',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.framepola.com',
    siteName: 'PolaToons',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.framepola.com'}/og-img.png`,
        width: 1200,
        height: 630,
        alt: 'PolaToons - Polaroid-Style 3D Cartoon Generator Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PolaToons - Turn Photos into Polaroid-Style 3D Cartoons',
    description: 'Transform your photos into playful Polaroid-style 3D cartoons in seconds with our easy-to-use, AI-powered generator. Try it now!',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://wwww.framepola.com'}/og-img.png`],
  },
}

// 定义 Organization 和 WebSite 的 Schema 结构化数据
const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "PolaToons",
      "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://wwww.framepola.com'
    },
    {
      "@type": "WebSite",
      "name": "PolaToons",
      "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://wwww.framepola.com',
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wwww.framepola.com'}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const GA_TRACKING_ID = 'G-BST9KGD31X';

  return (
    <html lang="en">
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
