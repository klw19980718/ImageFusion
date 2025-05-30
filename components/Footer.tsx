'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
// import { useParams } from 'next/navigation'; // No longer needed

export function Footer() {
  const t = useTranslations('footer');
  // const params = useParams(); // No longer needed
  // const currentLocale = params.locale as string || 'zh'; // No longer needed
  
  const partnerSites = [
    { url: 'https://www.framepola.com', name: 'AIPolaroid' },
    { url: 'https://www.ghiblimagicmaker.com', name: 'GhibliImage' },
    { url: 'https://www.ghiblitattoo.com', name: 'GhibliTattoo' },
    { url: 'https://www.aioutfitgen.com', name: 'OutfitAI' },
    { url: 'https://www.girlaniai.com', name: 'GirlCoolAnimeWallpaper' },
    { url: 'https://www.4oimagex.com', name: '4oImageX' },
    { url: 'https://www.invictgen.com', name: 'InvincibleTitleCardGenerator' },
    { url: 'https://www.aibabytalk.com', name: 'AiBabyPodcast' },
    { url: 'https://www.pencilartai.com', name: 'PencilArtMagic' },
    { url: 'https://www.imginpaint.com', name: 'AiInpainting' },
    { url: 'https://www.xbgremove.com', name: 'EraseBG' },
    { url: 'https://www.aithumbgen.com', name: 'AiThumbGen' },
    { url: 'https://www.genbabyname.com', name: 'NamiGenie' },
  ];
  
  return (
    <footer className="bg-background border-t border-muted py-12">
      <div className="container mx-auto px-6">
        {/* Partner Sites - Moved to Top */}
        <div className="mb-10 pb-6 border-b border-muted">
          <h3 className="font-semibold text-base text-foreground mb-4">
            PartnerSites
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {partnerSites.map((site, index) => (
              <a
                key={index}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-standard text-sm hover:underline decoration-primary decoration-1 underline-offset-2"
              >
                {site.name}
              </a>
            ))}
          </div>
        </div>

        {/* Main Content Section - Moved to Bottom */}
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
      </div>
    </footer>
  );
} 