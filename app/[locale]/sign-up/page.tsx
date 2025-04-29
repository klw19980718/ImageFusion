'use client';

import { SignUp } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignUpPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string || 'zh';
  const t = useTranslations('auth');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F0] py-12">
      <h1 className="text-3xl font-bold mb-8">{t('createAccount', { defaultMessage: '创建账号' })}</h1>
      <SignUp 
        redirectUrl={`/${locale}`}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#FFB347] hover:bg-[#F67280]',
            card: 'bg-white shadow-md'
          }
        }}
      />
    </div>
  );
} 