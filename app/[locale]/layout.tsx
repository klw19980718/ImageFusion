import { Navbar } from '../../components/Navbar';
import ClientProviders from './ClientProviders';
import ClerkProviderWithLocale from '../../components/auth/clerk-provider';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://framepola.com';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const awaitedParams = await params;
  const { locale } = awaitedParams;

  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') || '';
  
  const canonicalUrl = `${BASE_URL}${pathname === '/' ? `/${locale}` : `/${locale}${pathname}`}`;
  const englishUrl = `${BASE_URL}${pathname === '/' ? '/en' : `/en${pathname}`}`;
  const chineseUrl = `${BASE_URL}${pathname === '/' ? '/zh' : `/zh${pathname}`}`;

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': englishUrl,
        'zh': chineseUrl,
        'x-default': englishUrl,
      },
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
  const { locale } = await params;
  
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import(`../../messages/zh.json`)).default;
  }

  return (
    <ClientProviders locale={locale} messages={messages}>
      <ClerkProviderWithLocale>
        <main className="min-h-screen">
          <Navbar />
          {children}
        </main>
      </ClerkProviderWithLocale>
    </ClientProviders>
  )
} 