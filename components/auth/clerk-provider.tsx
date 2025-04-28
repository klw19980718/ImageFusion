'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { zhCN } from '@clerk/localizations';

// 自定义 Clerk 中文本地化配置
const customTranslations = {
  locale: "zh-CN",
  signIn: {
    start: {
      title: "登录",
      subtitle: "继续使用账号",
      actionText: "没有账号?",
      actionLink: "注册",
    },
    emailCode: {
      title: "通过邮箱验证码登录",
      subtitle: "验证码已发送至 {{identifier}}",
      formTitle: "验证码",
      formSubtitle: "输入发送到您邮箱的验证码",
      resendButton: "重新发送",
    },
    password: {
      title: "欢迎回来",
      subtitle: "请输入您的密码继续",
      formTitle: "密码",
      formSubtitle: "输入您的密码",
      forgotPasswordLink: "忘记密码?",
    },
    emailLink: {
      title: "通过邮箱链接登录",
      subtitle: "登录链接已发送至 {{identifier}}",
      formTitle: "邮箱验证",
      formSubtitle: "请查看您的邮箱",
      resendButton: "重新发送邮件",
    },
    phoneCode: {
      title: "手机验证",
      subtitle: "验证码已发送至 {{identifier}}",
      formTitle: "验证码",
      formSubtitle: "输入发送到您手机的验证码",
      resendButton: "重新发送",
    },
    continue: {
      title: "填写缺失的信息",
      subtitle: "继续注册",
    },
  },
  signUp: {
    start: {
      title: "创建账号",
      subtitle: "注册新账号",
      actionText: "已有账号?",
      actionLink: "登录",
    },
    emailLink: {
      title: "验证您的邮箱",
      subtitle: "验证链接已发送至 {{identifier}}",
      formTitle: "验证码",
      formSubtitle: "输入发送到您邮箱的验证码",
      resendButton: "重新发送",
    },
    emailCode: {
      title: "验证您的邮箱",
      subtitle: "验证码已发送至 {{identifier}}",
      formTitle: "验证码",
      formSubtitle: "输入发送到您邮箱的验证码",
      resendButton: "重新发送",
    },
    phoneCode: {
      title: "验证您的手机号",
      subtitle: "验证码已发送至 {{identifier}}",
      formTitle: "验证码",
      formSubtitle: "输入发送到您手机的验证码",
      resendButton: "重新发送",
    },
    continue: {
      title: "填写账户信息",
      subtitle: "继续您的注册",
    },
  },
  userProfile: {
    title: "个人资料",
    imageFormTitle: "个人头像",
    imageFormSubtitle: "点击上传",
    nameFormTitle: "姓名",
    nameFormSubtitle: "输入您的全名",
    usernameFormTitle: "用户名",
    usernameFormSubtitle: "设置您的唯一用户名",
  },
  userButton: {
    action__signOut: "退出登录",
    action__manageAccount: "管理账户",
    action__signOutAll: "退出所有账户",
  },
  formButtonPrimary: "继续",
  formButtonReset: "取消",
  breadcrumb: "返回",
  socialButtonsBlockButton: "继续使用 {{provider|titleize}}",
  dividerText: "或者",
  footerActionLink__useAnotherMethod: "使用其他方式",
  backButton: "返回",
  alert__verificationLinkSent: "新的验证链接已发送",
  alert__resendCodeSuccess: "新的验证码已发送",
  unstable__errors: {
    form_identifier_not_found: "无法找到此账户",
    form_password_incorrect: "密码不正确",
    form_param_format_invalid: "格式无效",
    form_param_format_invalid__email_address: "无效的邮箱地址",
    form_param_format_invalid__phone_number: "无效的手机号码",
    form_param_nil: "请填写必要信息",
    form_param_nil__email_address: "请输入邮箱地址",
    form_param_nil__phone_number: "请输入手机号码",
    form_param_nil__password: "请输入密码",
    form_password_validation_failed: "密码不正确",
    form_identifier_exists: "此账号已存在",
    form_password_length_too_short: "密码太短，至少需要 {{minimumLength}} 个字符",
    form_param_length_too_short__first_name: "名字不能为空",
    form_param_length_too_short__last_name: "姓氏不能为空",
    form_param_length_too_short__username: "用户名不能为空",
  }
};

export default function ClerkProviderWithLocale({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = params.locale as string || 'zh';
  console.log('Current locale:', locale);

  // 合并官方翻译和自定义翻译
  const mergedTranslations = {
    ...zhCN,
    ...customTranslations
  };

  return (
    <ClerkProvider 
      localization={zhCN}
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