'use client';

import { SignIn } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GoogleOneTapAuth } from '@/components/auth';

export default function SignInPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string || 'zh';
  const t = useTranslations('auth');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F0] py-12">
      {/* Google One Tap - 在登录页面显示 */}
      <GoogleOneTapAuth
        signInForceRedirectUrl={`/${locale}`}
        signUpForceRedirectUrl={`/${locale}`}
      />
      
      <h1 className="text-3xl font-bold mb-8">{t('welcome')}</h1>
      <SignIn 
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