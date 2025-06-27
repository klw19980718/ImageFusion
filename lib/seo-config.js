const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imagefusionai.com';

export const metadata = {
  title: 'ImageFusion - AI Image Fusion & Photo Blending Tool',
  description: 'Create stunning fused images with ImageFusion AI. Transform photos with advanced image fusion technology and creative style blending effortlessly.',
  keywords: ['imagefusion', 'AI image fusion', 'photo blending', 'image combiner', 'AI photo fusion', 'image merger'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'ImageFusion – AI Image Fusion | Professional Photo Blending Tool',
    description: 'Professional ImageFusion AI for creating stunning fused images with advanced image fusion technology. Transform your photos into artistic masterpieces effortlessly.',
    url: siteUrl,
    siteName: 'ImageFusion',
    images: [
      {
        url: `${siteUrl}/og-img.png`,
        width: 1200,
        height: 630,
        alt: 'ImageFusion - AI Image Fusion Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImageFusion – AI Image Fusion | Professional Photo Blending Tool',
    description: 'Professional ImageFusion AI for creating stunning fused images with advanced image fusion technology. Transform your photos into artistic masterpieces effortlessly.',
    images: [`${siteUrl}/og-img.png`],
  },
};

export const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "ImageFusion",
      "url": siteUrl,
      "description": "Professional AI image fusion platform"
    },
    {
      "@type": "WebSite",
      "name": "ImageFusion",
      "url": siteUrl,
      "description": "Advanced AI image fusion and photo blending platform",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "ImageFusion",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web Browser",
      "description": "Professional AI image fusion tool for creating high-quality blended images",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export { siteUrl }; 