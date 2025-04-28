'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface ClientProvidersProps {
  locale: string;
  messages: any;
  children: ReactNode;
}

export default function ClientProviders({ locale, messages, children }: ClientProvidersProps) {
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone="Asia/Shanghai"
    >
      {children}
    </NextIntlClientProvider>
  );
} 