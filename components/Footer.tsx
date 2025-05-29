'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
// import { useParams } from 'next/navigation'; // No longer needed

export function Footer() {
  const t = useTranslations('footer');
  // const params = useParams(); // No longer needed
  // const currentLocale = params.locale as string || 'zh'; // No longer needed
  
  const partnerSites = [
    { url: 'https://www.framepola.com', name: 'AI Polaroid' },
    { url: 'https://www.ghiblimagicmaker.com', name: 'GhibliImage' },
    { url: 'https://www.ghiblitattoo.com', name: 'GhibliTattoo' },
    { url: 'https://www.aioutfitgen.com', name: 'OutfitAI' },
    { url: 'https://www.girlaniai.com', name: 'Girl Cool Anime Wallpaper' },
    { url: 'https://www.4oimagex.com', name: '4o lmage X' },
    { url: 'https://www.invictgen.com', name: 'Invincible Title Card Generator' },
    { url: 'https://www.aibabytalk.com', name: 'ai baby podcast' },
    { url: 'https://www.pencilartai.com', name: 'PencilArtMagic' },
    { url: 'https://www.quickmedcert.com', name: 'QuickMedCert' },
    { url: 'https://www.imginpaint.com', name: 'AiInpainting' },
    { url: 'https://www.xbgremove.com', name: 'EraseBG' },
    { url: 'https://www.aithumbgen.com', name: 'AiThumbGen' },
    { url: 'https://www.genbabyname.com', name: 'NamiGenie' },
  ];
  
  return (
    <footer className="bg-background border-t border-muted py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Copyright */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {/* Consider applying the same font as Navbar Logo if desired */}
              <span className="text-2xl font-bold text-primary font-baloo" style={{ fontFamily: 'var(--font-baloo)' }} >
                ImageFusion
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('copyright')}
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              {t('navigation')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-standard text-sm"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition-standard text-sm"
                >
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#pricing" // Keep hash for section link
                  className="text-muted-foreground hover:text-primary transition-standard text-sm"
                >
                  {t('pricing')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              {t('legal')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-standard text-sm"
                >
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-standard text-sm"
                >
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Partner Sites - Horizontal Layout at Bottom */}
        <div className="mt-12 pt-8 border-t border-muted">
          <h3 className="font-semibold text-lg mb-6 text-foreground text-center">
            partnersites
          </h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {partnerSites.map((site, index) => (
              <a
                key={index}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-standard text-sm px-2 py-1 hover:bg-muted/50 rounded"
              >
                {site.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
} 