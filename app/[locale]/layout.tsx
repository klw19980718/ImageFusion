import ClientProviders from './ClientProviders';
import ClerkProviderWithLocale from '../../components/auth/clerk-provider';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://framepola.com';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://framepola.com',
    languages: {
      'en': 'https://framepola.com/en',
      'zh': 'https://framepola.com/zh',
      'x-default': 'https://framepola.com/en',
    },
  },
};

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
          {children}
        </main>
      </ClerkProviderWithLocale>
    </ClientProviders>
  )
} 