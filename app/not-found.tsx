import Link from 'next/link';

// 自定义 404 页面组件
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      {/* 404 错误码 */}
      <h1 className="text-6xl font-bold text-[#FFD700] mb-4">404</h1>
      {/* 页面未找到标题 - 加入关键词 */}
      <h2 className="text-2xl font-semibold mb-8">AI Image Fusion - Page Not Found</h2>
      {/* 描述信息 - 加入关键词 */}
      <p className="text-lg text-gray-400 mb-10 text-center max-w-md">
        Oops! The AI Image Fusion page you are looking for does not exist or has been moved.
      </p>
      {/* 返回首页按钮 */}
      <Link href="/">
        {/* 使用与项目一致的按钮样式 */}
        <button className="px-6 py-3 bg-[#FFD700] text-black font-medium rounded-lg hover:bg-[#FFD700]/80 transition-colors">
          Back to Homepage
        </button>
      </Link>
    </div>
  );
} 