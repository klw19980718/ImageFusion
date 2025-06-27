"use client";

import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "../../../components/Footer";
import Image from "next/image";
import { Progress } from "../../../components/ui/progress";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { api } from "@/app/config/api";
import { useUserInfo } from "@/lib/providers";
import { useToast } from "@/components/ui/toast-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 定义积分记录项的类型
interface TimesLogItem {
  id: number;
  user_id: number;
  change_type: string;
  use_limit: number;
  created_at: number;
  updated_at: number;
}

// 定义积分记录 API 返回的数据结构
interface TimesLogResponse {
  count: number;
  list: TimesLogItem[];
  total_page: number;
}

// 定义订阅记录项的类型
interface SubscriptionItem {
  id: number;
  pay_type: string;
  user_id: number;
  customer_id: string;
  subscription_id: string;
  price_id: string;
  created_at: number;
  updated_at: number;
  price_info: {
    id: number;
    appid: string;
    name: string;
    description: string;
    price: number;
    features: string;
    is_popular: number;
    button_text: string;
    usage_limit: number;
    level: number;
    stripe_id: number;
    prices_id: string;
    stripe_type: string;
    status: number;
  };
}

// 定义图片历史记录项的类型
interface GenerationHistoryItem {
  id: number;
  user_id: number;
  task_id: string;
  prompt: string;
  origin_image: string;
  generate_image: string; // 生成的图片URL
  status: number;
  created_at: number;
  updated_at: number;
}

// 定义图片历史记录 API 返回的数据结构
interface GenerationHistoryResponse {
  count: number;
  list: GenerationHistoryItem[];
  total_page: number;
}

// 将辅助函数移到组件外部
function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | "...")[] {
  const totalPageNumbers = siblingCount + 5; // siblings + first + last + current + 2*ellipsis

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1); // Fallback
}

// --- 将下载逻辑定义为独立函数 ---
async function downloadImageWithCors(
  imageUrl: string,
  filename: string,
  setIsDownloading: (id: number | null) => void,
  imageId: number,
  showToast: (message: string, type: 'success' | 'error') => void
) {
  setIsDownloading(imageId);
  try {
    const response = await fetch(imageUrl, { mode: "cors" });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}. Failed to fetch image. Check CORS headers on the server.`
      );
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || `ImageFusion-image-${imageId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);

    showToast('Image downloaded successfully!', 'success');
    console.log("Image download initiated!");
  } catch (error: any) {
    console.error("Download failed:", error);
    const errorMessage = 'Download failed!';
    
    if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
      showToast(`${errorMessage} Could not fetch image due to CORS restrictions.`, 'error');
    } else {
      showToast(`${errorMessage} Error: ${error.message}`, 'error');
    }
  } finally {
    setIsDownloading(null);
  }
}

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { userInfo, isLoadingUserInfo, refreshUserInfo } = useUserInfo();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const t = useTranslations("user");
  const commonT = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";

  // 图片历史记录状态
  const [historyList, setHistoryList] = useState<GenerationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const historyPageSize = 30;
  const [isDownloading, setIsDownloading] = useState<number | null>(null);

  // 积分记录状态
  const [timesLogList, setTimesLogList] = useState<TimesLogItem[]>([]);
  const [isLoadingTimesLog, setIsLoadingTimesLog] = useState(false);
  const [timesLogError, setTimesLogError] = useState<string | null>(null);
  const [timesLogCurrentPage, setTimesLogCurrentPage] = useState(1);
  const [timesLogTotalPages, setTimesLogTotalPages] = useState(0);
  const [isTimesLogDialogOpen, setIsTimesLogDialogOpen] = useState(false);
  const timesLogPageSize = 10;

  // 订阅记录状态
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionItem[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState<number | null>(null);

  // 未登录用户重定向到首页
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/${locale}`);
    }
  }, [isLoaded, isSignedIn, locale, router]);

  // API 调用 Effect (获取图片历史记录)
  useEffect(() => {
    const fetchGenerationHistory = async (page: number) => {
      if (!isLoaded || !user?.id) {
        setIsLoadingHistory(false);
        setHistoryList([]);
        setTotalPages(0);
        setTotalHistoryCount(0);
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const result = await api.user.getUserOpusList(page, historyPageSize, 0);

        if (result.code === 200 && result.data) {
          setHistoryList(result.data.list || []);
          setTotalPages(result.data.total_page || 0);
          setTotalHistoryCount(result.data.count || 0);
        } else {
          console.error("Failed to fetch history:", result.msg || 'Unknown API error');
          setHistoryError(result.msg || t("historyFetchError", { defaultMessage: "获取历史记录失败" }));
          setHistoryList([]);
          setTotalPages(0);
          setTotalHistoryCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setHistoryError(error instanceof Error ? error.message : "获取历史记录时发生未知错误");
        setHistoryList([]);
        setTotalPages(0);
        setTotalHistoryCount(0);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchGenerationHistory(currentPage);
  }, [isLoaded, user?.id, currentPage, historyPageSize, t]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      const historySection = document.getElementById("generation-history-section");
      if (historySection) {
        historySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // 刷新历史记录
  const refreshHistory = async () => {
    if (!isLoaded || !user?.id) return;

    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const result = await api.user.getUserOpusList(currentPage, historyPageSize, 0);

      if (result.code === 200 && result.data) {
        setHistoryList(result.data.list || []);
        setTotalPages(result.data.total_page || 0);
        setTotalHistoryCount(result.data.count || 0);
        showSuccessToast('History refreshed successfully!');
      } else {
        console.error("Failed to fetch history:", result.msg || 'Unknown API error');
        setHistoryError(result.msg || "获取历史记录失败");
        setHistoryList([]);
        setTotalPages(0);
        setTotalHistoryCount(0);
        showErrorToast('Failed to refresh history: ' + (result.msg || 'Unknown error'));
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistoryError(error instanceof Error ? error.message : "获取历史记录时发生未知错误");
      setHistoryList([]);
      setTotalPages(0);
      setTotalHistoryCount(0);
      showErrorToast('Failed to refresh history: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    try {
      return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(timestamp * 1000));
    } catch (e) {
      console.error("Error formatting date:", e);
      return new Date(timestamp * 1000).toLocaleDateString();
    }
  };

  // 获取积分记录数据的函数
  const fetchTimesLog = async (page: number) => {
    if (!isLoaded || !user?.id) return;

    setIsLoadingTimesLog(true);
    setTimesLogError(null);
    try {
      const result = await api.user.getTimesLog(page, timesLogPageSize);

      if (result.code === 200 && result.data) {
        setTimesLogList(result.data.list || []);
        setTimesLogTotalPages(result.data.total_page || 0);
      } else {
        console.error("Failed to fetch times log:", result.msg || 'Unknown API error');
        setTimesLogList([]);
        setTimesLogTotalPages(0);
        setTimesLogError(result.msg || 'Failed to fetch times log');
      }
    } catch (error) {
      console.error("Failed to fetch times log:", error);
      setTimesLogError(error instanceof Error ? error.message : 'An unknown error occurred fetching times log');
      setTimesLogList([]);
      setTimesLogTotalPages(0);
    } finally {
      setIsLoadingTimesLog(false);
    }
  };

  // Format change type
  const formatChangeType = (changeType: string): string => {
    const typeMap: Record<string, string> = {
      'buy_package': 'Buy Package',
      'create_task_free': 'Free Generation',
      'month_free': 'Monthly Free',
      'register_give': 'Registration Gift',
      'invite_reward': 'Invitation Reward',
      'daily_check': 'Daily Check-in',
      'refund': 'Refund',
    };
    return typeMap[changeType] || changeType;
  };

  // Open points log dialog
  const handleOpenTimesLogDialog = () => {
    setIsTimesLogDialogOpen(true);
    setTimesLogCurrentPage(1);
    fetchTimesLog(1);
  };

  // Handle points log page change
  const handleTimesLogPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= timesLogTotalPages && newPage !== timesLogCurrentPage) {
      setTimesLogCurrentPage(newPage);
      fetchTimesLog(newPage);
    }
  };

  // 获取订阅记录数据的函数
  const fetchSubscriptions = async () => {
    if (!isLoaded || !user?.id) return;

    setIsLoadingSubscriptions(true);
    setSubscriptionError(null);
    try {
      const result = await api.payment.getSubscriptions();

      if (result.code === 200 && Array.isArray(result.data)) {
        setSubscriptionList(result.data);
      } else {
        console.error("Failed to fetch subscriptions:", result.msg || 'Unknown API error');
        setSubscriptionList([]);
        setSubscriptionError(result.msg || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      setSubscriptionError(error instanceof Error ? error.message : 'An unknown error occurred fetching subscriptions');
      setSubscriptionList([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  // 取消订阅函数
  const handleCancelSubscription = async (subscriptionId: number) => {
    setCancellingSubscriptionId(subscriptionId);
    try {
      const result = await api.payment.cancelSubscription(subscriptionId);

      if (result.code === 200) {
        // 取消成功，刷新订阅记录
        await fetchSubscriptions();
        showSuccessToast('Subscription cancelled successfully!');
      } else {
        console.error("Failed to cancel subscription:", result.msg || 'Unknown API error');
        showErrorToast('Failed to cancel subscription: ' + (result.msg || 'Unknown error'));
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      showErrorToast('Failed to cancel subscription: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCancellingSubscriptionId(null);
    }
  };

  // 打开订阅记录弹窗
  const handleOpenSubscriptionDialog = () => {
    setIsSubscriptionDialogOpen(true);
    fetchSubscriptions();
  };

  // 格式化价格显示
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">
            {commonT("loading", { defaultMessage: "加载中..." })}
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  // 根据 API 数据计算使用率
  const usagePercentage = userInfo?.total_limit && userInfo.total_limit > 0
    ? (userInfo.use_limit / userInfo.total_limit) * 100
    : 0;

  // 获取订阅计划名称
  const getPlanName = (level: number | undefined) => {
    if (!level && level !== 0) return t("freeUser", { defaultMessage: "Free User" });
    switch (level) {
      case 0:
        return t("freeUser", { defaultMessage: "Free User" });
      case 1:
        return t("premiumPlan", { defaultMessage: "Premium Plan" });
      case 2:
        return t("ultimatePlan", { defaultMessage: "Ultimate Plan" });
      default:
        return t("freeUser", { defaultMessage: "Free User" });
    }
  };

  const currentPlanName = getPlanName(userInfo?.level);

  // 过滤出有效图片的历史记录
  const validHistoryList = historyList.filter((item) => item.generate_image && item.generate_image.trim() !== '');

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        {/* 用户信息区 */}
        <div className="mb-12">
          {isLoadingUserInfo ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-gray-800 rounded-full animate-pulse mb-4"></div>
              <div className="w-48 h-6 bg-gray-800 rounded animate-pulse mb-2"></div>
              <div className="w-32 h-4 bg-gray-800 rounded animate-pulse"></div>
            </div>
          ) : userInfo ? (
            <div className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FFD700]/30">
                    {userInfo?.avatar ? (
                      <Image
                        src={userInfo.avatar}
                        alt={t('avatarAlt', { name: userInfo.nickname || 'User' })}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl text-[#FFD700]">
                        {(userInfo?.nickname || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-2">
                    {userInfo?.nickname || t('nicknameNotSet')}
                  </h1>
                  <p className="text-gray-400 mb-4">{userInfo?.email}</p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-[#FFD700]/10">
                      <p className="text-sm text-gray-400">{t('membershipLevel')}</p>
                      <p className="text-lg font-medium text-[#FFD700]">
                        {currentPlanName}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-[#FFD700]/10">
                      <p className="text-sm text-gray-400">{t('pointsRemaining')}</p>
                      <p className="text-lg font-medium text-[#FFD700]">
                        {userInfo.total_credits || 0}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-[#FFD700]/10">
                      <p className="text-sm text-gray-400">{t('generatedImages')}</p>
                      <p className="text-lg font-medium text-[#FFD700]">
                        {userInfo?.use_limit || 0}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-[#FFD700]/10">
                      <p className="text-sm text-gray-400">{t('totalApiCalls')}</p>
                      <p className="text-lg font-medium text-[#FFD700]">
                        {userInfo?.total_limit || 0}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3 flex-wrap">
                    <Button
                      onClick={handleOpenTimesLogDialog}
                      variant="outline"
                      size="sm"
                      className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                    >
                      Points Log
                    </Button>
                    <Button
                      onClick={handleOpenSubscriptionDialog}
                      variant="outline"
                      size="sm"
                      className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                    >
                      Subscriptions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl p-8 text-center">
              <p className="text-xl mb-4">{t('loginPromptProfile')}</p>
              <button
                onClick={() =>
                  (window.location.href = `/${locale}/sign-in?redirect_url=/${locale}/profile`)
                }
                className="px-6 py-2 bg-[#FFD700] text-black font-medium rounded-lg hover:bg-[#FFD700]/80 transition-colors"
              >
                {t('loginAction')}
              </button>
            </div>
          )}
        </div>

        {/* 生成历史区 */}
        {userInfo && (
          <div id="generation-history-section" className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold border-b border-[#FFD700]/20 pb-2 text-[#FFD700]">
                {t('historyTitle')}
              </h2>
              <Button 
                onClick={refreshHistory} 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                disabled={isLoadingHistory}
              >
                {isLoadingHistory ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </Button>
            </div>

            {isLoadingHistory ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg"
                  >
                    <div className="h-48 bg-gray-800 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-800 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : historyError ? (
              <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg px-4">
                <p className="text-red-600">
                  {t("errorFetchingHistory", {
                    defaultMessage: "Error loading generation history:",
                  })}{" "}
                  {historyError}
                </p>
                <Button
                  variant="link"
                  className="mt-2 text-red-600"
                  onClick={() => handlePageChange(currentPage)}
                >
                  {t("retry", { defaultMessage: "Retry" })}
                </Button>
              </div>
            ) : validHistoryList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {validHistoryList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all"
                    >
                      <div className="relative bg-gray-800 overflow-hidden" style={{ paddingBottom: '150%' }}>
                        <Image
                          src={item.generate_image}
                          alt={t('generatedImageAlt')}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                          className="object-cover transition-transform hover:scale-105"
                        />
                        <button
                          onClick={() =>
                            downloadImageWithCors(
                              item.generate_image,
                              `ImageFusion-image-${item.id}.png`,
                              setIsDownloading,
                              item.id,
                              (message, type) => type === 'success' ? showSuccessToast(message) : showErrorToast(message)
                            )
                          }
                          className="absolute top-2 right-2 bg-black/60 p-2 rounded-full hover:bg-black/80 transition-colors flex items-center justify-center w-9 h-9"
                          title={t('downloadImage')}
                          disabled={isDownloading !== null}
                        >
                        {isDownloading === item.id ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-5 h-5 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        )}
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-gray-400 text-sm">
                          {formatTimestamp(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 分页控制 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-[#FFD700]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    >
                      {t('paginationPrevious')}
                    </button>
                    <span className="px-4 py-2 rounded-lg bg-gray-800 border border-[#FFD700]/30">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-[#FFD700]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    >
                      {t('paginationNext')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl p-8 text-center">
                <p className="text-gray-400 mb-4">{t('noImagesYet')}</p>
                <Link
                  href="/"
                  className="px-6 py-2 bg-[#FFD700] text-black font-medium rounded-lg hover:bg-[#FFD700]/80 transition-colors inline-block"
                >
                  {t('goGenerate')}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 积分记录对话框 */}
        <Dialog open={isTimesLogDialogOpen} onOpenChange={setIsTimesLogDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-[#FFD700]/20 bg-gray-900 text-white">
            <DialogHeader className="text-center pb-6 border-b border-[#FFD700]/20">
              <DialogTitle className="text-2xl font-semibold text-[#FFD700]">
                Points Log
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-2">
                View your points transaction history
              </DialogDescription>
            </DialogHeader>
            <div className="pt-6">
              {isLoadingTimesLog ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 font-medium">{commonT('loading', { defaultMessage: '加载中...' })}</p>
                </div>
              ) : timesLogError ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-500 text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-400 font-medium">Failed to load: {timesLogError}</p>
                </div>
              ) : timesLogList.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {timesLogList.map((item) => (
                      <div key={item.id} className="group p-6 rounded-2xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 border border-[#FFD700]/10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <span className="font-semibold text-[#FFD700] text-lg">
                                {formatChangeType(item.change_type)}
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                item.use_limit > 0 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {item.use_limit > 0 ? '+' : ''}{item.use_limit}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm font-medium">
                              {formatTimestamp(item.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 积分记录分页 */}
                  {timesLogTotalPages > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                      <button
                        onClick={() => handleTimesLogPageChange(timesLogCurrentPage - 1)}
                        disabled={timesLogCurrentPage === 1}
                        className="px-4 py-2 rounded-lg border border-[#FFD700]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                      >
                        {t('paginationPrevious')}
                      </button>
                      <span className="px-4 py-2 rounded-lg bg-gray-800 border border-[#FFD700]/30">
                        {timesLogCurrentPage} / {timesLogTotalPages}
                      </span>
                      <button
                        onClick={() => handleTimesLogPageChange(timesLogCurrentPage + 1)}
                        disabled={timesLogCurrentPage === timesLogTotalPages}
                        className="px-4 py-2 rounded-lg border border-[#FFD700]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                      >
                        {t('paginationNext')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#FFD700] text-3xl">📊</span>
                  </div>
                  <p className="text-gray-400 font-medium text-lg">No points records yet</p>
                  <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 订阅记录对话框 */}
        <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
          <DialogContent className="max-w-fit min-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl border border-[#FFD700]/20 bg-gray-900 text-white">
            <DialogHeader className="text-center pb-6 border-b border-[#FFD700]/20">
              <DialogTitle className="text-2xl font-semibold text-[#FFD700]">
                Subscriptions
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-2">
                Manage your subscriptions
              </DialogDescription>
            </DialogHeader>
            <div className="pt-6">
              {isLoadingSubscriptions ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 font-medium">{commonT('loading', { defaultMessage: '加载中...' })}</p>
                </div>
              ) : subscriptionError ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-500 text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-400 font-medium">Failed to load: {subscriptionError}</p>
                </div>
              ) : subscriptionList.length > 0 ? (
                <div className="grid gap-6">
                  {subscriptionList.map((subscription) => (
                    <div key={subscription.id} className="group relative p-6 rounded-3xl bg-gray-800 border border-[#FFD700]/20 shadow-lg hover:shadow-[#FFD700]/10 transition-all duration-300">
                      {/* 顶部彩条 */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-3xl"></div>
                      
                      {/* 头部区域：名称、状态、价格、按钮 */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-2xl font-bold text-[#FFD700] tracking-tight">
                            {subscription.price_info.name}
                          </h3>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Active
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-3xl font-bold text-[#FFD700]">
                            {formatPrice(subscription.price_info.price)}
                          </div>
                          <Button
                            variant={subscription.price_info.button_text === 'Contact Sales' ? 'outline' : 'destructive'}
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            disabled={cancellingSubscriptionId === subscription.id || subscription.price_info.button_text === 'Contact Sales'}
                            className={`min-w-[120px] rounded-full transition-all duration-200 ${
                              subscription.price_info.button_text === 'Contact Sales' 
                                ? 'border-gray-400 text-gray-400 cursor-not-allowed opacity-60' 
                                : 'bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 shadow-md hover:shadow-lg'
                            }`}
                          >
                            {cancellingSubscriptionId === subscription.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span>Cancelling...</span>
                              </>
                            ) : (
                              subscription.price_info.button_text === 'Contact Sales' 
                                ? 'Contact Sales'
                                : 'Cancel Plan'
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* 底部信息 */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 bg-gray-700/50 rounded-2xl p-4 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-300">ID:</span>
                          <span className="font-mono text-xs bg-gray-600 px-2 py-1 rounded">{subscription.subscription_id.slice(-8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-300">Started:</span>
                          <span>{formatTimestamp(subscription.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-300">Usage Limit:</span>
                          <span className="font-semibold text-[#FFD700]">
                            {subscription.price_info.usage_limit === 99999 
                              ? 'Unlimited'
                              : subscription.price_info.usage_limit
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-[#FFD700] text-4xl">💳</span>
                  </div>
                  <p className="text-gray-300 font-semibold text-xl mb-2">No active subscriptions</p>
                  <p className="text-gray-500 text-sm">Subscribe to get started</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
