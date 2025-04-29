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
import { apiConfig } from "@/app/config/api";

// 定义从API获取的用户信息类型
interface UserApiInfo {
  google_id: string;
  avatar: string;
  name: string;
  email: string;
  level: 0 | 1 | 2; // 0: none, 1: premium, 2: ultimate
  api_total_times: number;
  api_used_times: number;
  api_left_times: number;
  subscription_status: string; // 可能为空或有值
  current_period_end: number; // 时间戳
  created: number; // 时间戳
}

// 定义图片历史记录项的类型
interface GenerationHistoryItem {
  id: number;
  google_id: string;
  task_id: string;
  prompt: string;
  origin_image: string;
  dist_image: string; // 我们将主要使用这个图片URL
  size: string;
  is_enhance: number;
  status: number;
  created: number;
  updated: number;
}

// 定义图片历史记录 API 返回的数据结构
interface GenerationHistoryResponse {
  count: number;
  list: GenerationHistoryItem[];
  total_page: number; // API 直接返回了总页数，很好
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
// 添加 setIsDownloading 和 t 作为参数
async function downloadImageWithCors(
  imageUrl: string,
  filename: string,
  setIsDownloading: (id: number | null) => void, // 用于更新加载状态
  imageId: number, // 图片 ID 用于设置加载状态
  t: Function // 翻译函数
) {
  setIsDownloading(imageId); // 开始下载，设置加载状态
  try {
    // 1. 发起 fetch 请求
    const response = await fetch(imageUrl, { mode: "cors" });

    // 检查响应是否成功并且是 CORS 允许的
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}. Failed to fetch image. Check CORS headers on the server.`
      );
    }

    // 2. 将响应体转换为 Blob 对象
    const blob = await response.blob();

    // 3. 创建一个指向 Blob 的 Object URL
    const objectUrl = URL.createObjectURL(blob);

    // 4. 创建 <a> 标签并触发下载
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || `polatoons-image-${imageId}.png`; // 使用传入的 filename 或生成一个
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. 释放 Object URL 资源
    URL.revokeObjectURL(objectUrl);

    console.log("Image download initiated!");
  } catch (error: any) {
    console.error("Download failed:", error);
    // 使用翻译函数 t 显示错误信息
    const errorMessage = t("downloadFailed", {
      defaultMessage: "Download failed!",
    });
    const corsMessage = t("downloadCorsError", {
      defaultMessage:
        "Could not fetch image from {imageUrl}. This is often due to missing CORS headers (Access-Control-Allow-Origin) on the server. Check the browser console for details.",
      imageUrl: imageUrl,
    });
    const genericMessage = t("downloadGenericError", {
      defaultMessage: "Error: {errorMsg}",
      errorMsg: error.message,
    });

    // 检查是否是网络错误或类型错误（通常与 CORS 相关）
    if (
      error.message.includes("Failed to fetch") ||
      error.name === "TypeError"
    ) {
      alert(`${errorMessage}\n\n${corsMessage}`);
    } else {
      alert(`${errorMessage} ${genericMessage}`);
    }
  } finally {
    setIsDownloading(null); // 结束下载（无论成功或失败），清除加载状态
  }
}

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const t = useTranslations("user");
  const commonT = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "zh";

  // API 数据状态 (用户信息)
  const [userApiInfo, setUserApiInfo] = useState<UserApiInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  // 图片历史记录状态
  const [historyList, setHistoryList] = useState<GenerationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const historyPageSize = 30;
  const [isDownloading, setIsDownloading] = useState<number | null>(null); // 跟踪正在下载的图片ID

  // 动态设置页面标题
  useEffect(() => {
    if (isLoaded && user) {
      document.title = `${
        user.fullName || user.username || "Profile"
      } - PolaToons`;
    } else if (isLoaded && !user) {
      document.title = `Profile - PolaToons`; // 用户未登录的情况
    }
  }, [isLoaded, user]);

  // 未登录用户重定向到首页
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/${locale}`);
    }
  }, [isLoaded, isSignedIn, locale, router]);

  // 添加调试日志
  useEffect(() => {
    console.log("Auth state:", { isLoaded, isSignedIn, userId: user?.id });
  }, [isLoaded, isSignedIn, user]);

  // API 调用 Effect (获取用户信息)
  useEffect(() => {
    if (isLoaded && user?.id) {
      const fetchUserInfo = async () => {
        setIsLoadingUserInfo(true);
        setUserInfoError(null);
        try {
          const googleIdToFetch = user?.id || "";
          const response = await fetch(
            `${apiConfig.userInfo}?google_id=${googleIdToFetch}`
          );
          if (!response.ok) {
            throw new Error(
              `API Error: ${response.status} ${response.statusText}`
            );
          }
          const result = await response.json();
          if (result.code === 1000 && result.data) {
            setUserApiInfo(result.data);
          } else {
            console.warn(
              "User info API returned success code but no data for:",
              googleIdToFetch
            );
            setUserApiInfo(null);
          }
        } catch (error) {
          console.error("Failed to fetch user API info:", error);
          setUserInfoError(
            error instanceof Error
              ? error.message
              : "An unknown error occurred fetching user info"
          );
        } finally {
          setIsLoadingUserInfo(false);
        }
      };
      fetchUserInfo();
    } else if (isLoaded && !user) {
      setIsLoadingUserInfo(false);
      setUserApiInfo(null);
    }
  }, [isLoaded, user]);

  // API 调用 Effect (获取图片历史记录)
  useEffect(() => {
    if (isLoaded && user?.id) {
      const fetchGenerationHistory = async (page: number) => {
        setIsLoadingHistory(true);
        setHistoryError(null);
        try {
          const googleIdToFetch = user?.id || "";
          const response = await fetch(`${apiConfig.opusList}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              page: page,
              page_size: historyPageSize,
              google_id: googleIdToFetch,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `API Error: ${response.status} ${response.statusText}`
            );
          }
          const result = await response.json();

          if (result.code === 1000 && result.data) {
            setHistoryList(result.data.list || []);
            setTotalPages(result.data.total_page || 0);
            setTotalHistoryCount(result.data.count || 0);
          } else {
            console.error(
              "Failed to fetch history:",
              result.msg || "Unknown API error"
            );
            setHistoryError(
              result.msg ||
                t("historyFetchError", { defaultMessage: "获取历史记录失败" })
            );
            setHistoryList([]);
          }
        } catch (error) {
          console.error("Failed to fetch history:", error);
          setHistoryError(
            error instanceof Error
              ? error.message
              : "获取历史记录时发生未知错误"
          );
          setHistoryList([]);
        } finally {
          setIsLoadingHistory(false);
        }
      };

      fetchGenerationHistory(currentPage);
    } else if (isLoaded && !user) {
      setIsLoadingHistory(false);
      setHistoryList([]);
    }
  }, [isLoaded, user, currentPage, historyPageSize, t]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      const historySection = document.getElementById(
        "generation-history-section"
      );
      if (historySection) {
        historySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
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

  const initials = `${user.firstName?.[0] || ""}${
    user.lastName?.[0] || ""
  }`.toUpperCase();

  // 根据 API 数据计算使用率
  const usagePercentage =
    userApiInfo?.api_total_times && userApiInfo.api_total_times > 0
      ? (userApiInfo.api_used_times / userApiInfo.api_total_times) * 100
      : 0;

  // 获取订阅计划名称 (可以从翻译文件获取)
  const getPlanName = (level: number | undefined) => {
    switch (level) {
      case 1:
        return t("premiumPlan", { defaultMessage: "Premium Plan" }); // Level 1 -> Basic
      case 2:
        return t("ultimatePlan", { defaultMessage: "Ultimate Plan" }); // Level 2 -> Premium
      // case 3: return t('ultimatePlan', {defaultMessage: 'Ultimate Plan'}); // Level 3 -> Ultimate
      default:
        return t("noSubscription", { defaultMessage: "No Subscription" }); // Level 0 或 undefined -> No Subscription
    }
  };
  const currentPlanName = getPlanName(userApiInfo?.level);

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
          ) : userInfoError ? (
            <div className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FFD700]/30">
                    {userApiInfo?.avatar ? (
                      <Image
                        src={userApiInfo.avatar}
                        alt={userApiInfo.name || "用户头像"}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl text-[#FFD700]">
                        {(userApiInfo?.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-2">
                    {userApiInfo?.name || "未设置昵称"}
                  </h1>
                  <p className="text-gray-400 mb-4">{userApiInfo?.email}</p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-[#FFD700]/10">
                      <p className="text-sm text-gray-400">会员等级</p>
                      <p className="text-lg font-medium text-[#FFD700]">
                        {userApiInfo && userApiInfo.level > 0
                          ? currentPlanName
                          : t("noSubscription", { defaultMessage: "免费用户" })}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-[#FFD700]/10">
                      <p className="text-sm text-gray-400">剩余积分</p>
                      <p className="text-lg font-medium text-[#FFD700]">
                        {userApiInfo?.api_left_times || 0}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-[#FFD700]/10">
                      <p className="text-sm text-gray-400">已生成图片</p>
                      <p className="text-lg font-medium text-[#FFD700]">
                        {userApiInfo?.api_used_times || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl p-8 shadow-lg text-center">
              <p className="text-xl mb-4">请先登录查看您的个人信息</p>
              <button
                onClick={() =>
                  (window.location.href = `/${locale}/sign-in?redirect_url=/${locale}/profile`)
                }
                className="px-6 py-2 bg-[#FFD700] text-black font-medium rounded-lg hover:bg-[#FFD700]/80 transition-colors"
              >
                登录
              </button>
            </div>
          )}
        </div>

        {/* 生成历史区 */}
        {userApiInfo && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 border-b border-[#FFD700]/20 pb-2 text-[#FFD700]">
              生成历史
            </h2>

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
            ) : totalHistoryCount > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all"
                    >
                      <div className="relative h-48 bg-gray-800 overflow-hidden">
                        <Image
                          src={item.dist_image}
                          alt={item.prompt || "生成图片"}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform hover:scale-105"
                        />
                        <button
                          onClick={() =>
                            downloadImageWithCors(
                              item.dist_image,
                              `polatoons-image-${item.id}.png`,
                              setIsDownloading,
                              item.id,
                              t
                            )
                          }
                          className="absolute top-2 right-2 bg-black/60 p-2 rounded-full hover:bg-black/80 transition-colors"
                          title="下载图片"
                        >
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
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-400 text-sm mb-2">
                          {new Date(item.created).toLocaleDateString()}
                        </p>
                        <p className="line-clamp-2 text-sm">{item.prompt}</p>
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
                      上一页
                    </button>
                    <span className="px-4 py-2 rounded-lg bg-gray-800 border border-[#FFD700]/30">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-[#FFD700]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-900 border border-[#FFD700]/20 rounded-2xl p-8 text-center">
                <p className="text-gray-400 mb-4">您还没有生成过图片</p>
                <Link
                  href="/"
                  className="px-6 py-2 bg-[#FFD700] text-black font-medium rounded-lg hover:bg-[#FFD700]/80 transition-colors inline-block"
                >
                  去生成图片
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
