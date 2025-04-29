'use client';

import { useEffect } from 'react';
import { useSignIn, useSignUp, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallback() {
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { session } = useClerk();
  const router = useRouter();

  // 输出详细的Clerk状态信息
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('=== SSO回调页面状态 ===');
    console.log('页面URL:', window.location.href);
    console.log('时间:', new Date().toISOString());
    console.log('SignIn加载状态:', isSignInLoaded);
    console.log('SignUp加载状态:', isSignUpLoaded);
    console.log('User加载状态:', isUserLoaded);
    console.log('用户是否已登录:', isSignedIn);
    console.log('当前会话:', session?.id || 'null');
    console.log('用户信息:', user?.id || 'null');
    
    // 检查localStorage中的会话信息
    try {
      const clerkItems = Object.keys(localStorage).filter(key => 
        key.includes('clerk') || key.includes('__clerk')
      );
      console.log('Clerk本地存储项:', clerkItems);
      
      // 检查cookies
      console.log('所有Cookies:', document.cookie);
    } catch (e) {
      console.log('无法访问存储', e);
    }
  }, [isSignInLoaded, isSignUpLoaded, isUserLoaded, isSignedIn, user, session]);

  useEffect(() => {
    // 确保在客户端环境
    if (typeof window === 'undefined') return;
    
    // 记录页面加载
    console.log('SSO回调页面加载，URL:', window.location.href);
    
    // 确保Clerk已加载
    if (!isSignInLoaded || !isSignUpLoaded) {
      console.log('Clerk尚未加载完成 - SignIn已加载:', isSignInLoaded, '| SignUp已加载:', isSignUpLoaded);
      return;
    }

    console.log('Clerk已加载完成，准备处理回调');

    // 处理回调
    async function handleCallback() {
      try {
        if (!window.location.search) {
          console.log('没有查询参数，重定向到首页');
          router.push('/');
          return;
        }

        const params = new URLSearchParams(window.location.search);
        console.log('回调URL参数:', Object.fromEntries(params.entries()));
        
        // 检查是否有认证票据
        if (!params.has('__clerk_ticket')) {
          console.log('没有找到Clerk票据，重定向到首页');
          router.push('/');
          return;
        }

        const ticket = params.get('__clerk_ticket') || '';
        console.log('获取到Clerk票据:', ticket.substring(0, 10) + '...');

        // 尝试处理登录回调
        if (signIn) {
          try {
            console.log('尝试处理登录票据...');
            const result = await signIn.create({
              strategy: "ticket",
              ticket
            });
            
            console.log('登录票据处理成功:', result);
            console.log('准备重定向到首页...');
            
            // 存储会话标记
            try {
              sessionStorage.setItem('clerk_login_success', 'true');
              sessionStorage.setItem('clerk_login_time', new Date().toISOString());
            } catch (e) {
              console.log('无法写入会话存储', e);
            }
            
            // 使用replace防止历史记录问题
            window.location.replace('/');
            return;
          } catch (err) {
            // 如果不是登录票据，可能是注册票据
            console.log('处理登录票据失败，可能是注册票据:', err);
            console.log('错误详情:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
          }
        }

        // 尝试处理注册回调
        if (signUp) {
          try {
            console.log('尝试处理注册票据...');
            const result = await signUp.create({
              strategy: "ticket",
              ticket
            });
            
            console.log('注册票据处理成功:', result);
            console.log('准备重定向到首页...');
            
            // 存储会话标记
            try {
              sessionStorage.setItem('clerk_signup_success', 'true');
              sessionStorage.setItem('clerk_signup_time', new Date().toISOString());
            } catch (e) {
              console.log('无法写入会话存储', e);
            }
            
            // 使用replace防止历史记录问题
            window.location.replace('/');
            return;
          } catch (err) {
            console.error('处理注册票据失败:', err);
            console.log('错误详情:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
            window.location.replace('/');
          }
        }
      } catch (error) {
        console.error('SSO回调处理失败:', error);
        console.log('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        window.location.replace('/');
      }
    }

    handleCallback();
  }, [isSignInLoaded, isSignUpLoaded, signIn, signUp, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
        <h2 className="text-xl font-semibold">正在处理您的登录...</h2>
        <p className="mt-2 text-gray-500">请稍候，不要关闭此页面</p>
        <p className="mt-2 text-xs text-gray-400">处理中: {typeof window !== 'undefined' ? window.location.search : ''}</p>
      </div>
    </div>
  );
} 