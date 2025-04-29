'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { zhCN, enUS } from '@clerk/localizations';
import { DeepPartial, LocalizationResource } from '@clerk/types';

export default function ClerkProviderWithLocale({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = params.locale as string || 'zh';
  console.log('Current locale for Clerk:', locale);

  // 根据当前语言选择不同的本地化配置
  const localization = locale === 'zh' ? zhCN : enUS;

  return (
    <ClerkProvider 
      localization={localization}
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
          socialButtonsPlacement: "top",
          showOptionalFields: false,
          shimmer: true
        },
        variables: {
          colorPrimary: "#000000",
          colorBackground: "#ffffff",
          colorText: "#000000",
          colorTextSecondary: "#666666",
          borderRadius: "0.5rem",
          fontFamily: "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei'"
        },
        elements: {
          formButtonPrimary: "bg-black hover:bg-gray-800 text-sm normal-case",
          card: "shadow-none",
          footer: "hidden",
          formFieldInput: "rounded-md border-gray-300 focus:border-black focus:ring-black",
          formFieldLabel: "text-gray-700",
          main: "min-w-[320px] font-sans",
          identityPreview: "shadow-sm border-gray-200"
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
} 