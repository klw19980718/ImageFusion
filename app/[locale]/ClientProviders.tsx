'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { UserProvider } from '@/lib/providers';
import { ToastProvider } from '@/components/ui/toast-provider';
import ClerkProviderWithLocale from '@/components/auth/clerk-provider';

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
      <ClerkProviderWithLocale>
        <ToastProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ToastProvider>
      </ClerkProviderWithLocale>
    </NextIntlClientProvider>
  );
} 