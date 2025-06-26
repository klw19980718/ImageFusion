'use client';

import { GoogleOneTap } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

interface GoogleOneTapAuthProps {
  /** 如果为true，当用户点击提示框外部时会自动关闭One Tap提示框。默认: true */
  cancelOnTapOutside?: boolean;
  /** 如果为true，在ITP浏览器（如iOS上的Chrome、Safari和FireFox）上启用ITP特定的用户体验。默认: true */
  itpSupport?: boolean;
  /** 如果为true，启用Google One Tap使用FedCM API登录用户。默认: true */
  fedCmSupport?: boolean;
  /** 登录后的重定向URL，会覆盖ClerkProvider的设置 */
  signInForceRedirectUrl?: string;
  /** 注册后的重定向URL，会覆盖ClerkProvider的设置 */
  signUpForceRedirectUrl?: string;
}

export default function GoogleOneTapAuth({
  cancelOnTapOutside = true,
  itpSupport = true,
  fedCmSupport = true,
  signInForceRedirectUrl,
  signUpForceRedirectUrl,
}: GoogleOneTapAuthProps) {
  const { isSignedIn, user } = useUser();

  // 调试信息
  console.log('GoogleOneTapAuth - isSignedIn:', isSignedIn);
  console.log('GoogleOneTapAuth - user:', user);
  console.log('GoogleOneTapAuth - signInForceRedirectUrl:', signInForceRedirectUrl);

  // 如果用户已登录，不显示Google One Tap
  if (isSignedIn) {
    console.log('GoogleOneTapAuth - User is signed in, not showing One Tap');
    return null;
  }

  console.log('GoogleOneTapAuth - Rendering Google One Tap');

  return (
    <GoogleOneTap
      cancelOnTapOutside={cancelOnTapOutside}
      itpSupport={itpSupport}
      fedCmSupport={fedCmSupport}
      signInForceRedirectUrl={signInForceRedirectUrl}
      signUpForceRedirectUrl={signUpForceRedirectUrl}
    />
  );
} 