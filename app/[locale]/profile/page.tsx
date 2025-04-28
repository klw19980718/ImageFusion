'use client';

import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Footer } from '../../../components/Footer';
import Image from 'next/image';
import { Progress } from '../../../components/ui/progress';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
function getPaginationItems(currentPage: number, totalPages: number, siblingCount = 1): (number | '...')[] {
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
    return [...leftRange, '...', lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
    return [firstPageIndex, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
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
    const response = await fetch(imageUrl, { mode: 'cors' });

    // 检查响应是否成功并且是 CORS 允许的
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}. Failed to fetch image. Check CORS headers on the server.`);
    }

    // 2. 将响应体转换为 Blob 对象
    const blob = await response.blob();

    // 3. 创建一个指向 Blob 的 Object URL
    const objectUrl = URL.createObjectURL(blob);

    // 4. 创建 <a> 标签并触发下载
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename || `polatoons-image-${imageId}.png`; // 使用传入的 filename 或生成一个
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. 释放 Object URL 资源
    URL.revokeObjectURL(objectUrl);

    console.log('Image download initiated!');

  } catch (error: any) {
    console.error('Download failed:', error);
    // 使用翻译函数 t 显示错误信息
    const errorMessage = t('downloadFailed', { defaultMessage: 'Download failed!' });
    const corsMessage = t('downloadCorsError', {
        defaultMessage: 'Could not fetch image from {imageUrl}. This is often due to missing CORS headers (Access-Control-Allow-Origin) on the server. Check the browser console for details.',
        imageUrl: imageUrl
    });
    const genericMessage = t('downloadGenericError', { defaultMessage: 'Error: {errorMsg}', errorMsg: error.message });

    // 检查是否是网络错误或类型错误（通常与 CORS 相关）
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        alert(`${errorMessage}\n\n${corsMessage}`);
    } else {
        alert(`${errorMessage} ${genericMessage}`);
    }
  } finally {
    setIsDownloading(null); // 结束下载（无论成功或失败），清除加载状态
  }
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const t = useTranslations('user');
  const commonT = useTranslations('common');
  const params = useParams();
  const locale = params.locale as string || 'zh';

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
      document.title = `${user.fullName || user.username || 'Profile'} - PolaToons`;
    } else if (isLoaded && !user) {
      document.title = `Profile - PolaToons`; // 用户未登录的情况
    }
  }, [isLoaded, user]);

  // API 调用 Effect (获取用户信息)
  useEffect(() => {
    if (isLoaded && user?.id) {
      const fetchUserInfo = async () => {
        setIsLoadingUserInfo(true);
        setUserInfoError(null);
        try {
          const googleIdToFetch = user?.id || '';
          const response = await fetch(`https://cartoon.framepola.com/api/user/info?google_id=${googleIdToFetch}`);
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          const result = await response.json();
          if (result.code === 1000 && result.data) {
            setUserApiInfo(result.data);
          } else {
            console.warn("User info API returned success code but no data for:", googleIdToFetch);
            setUserApiInfo(null);
          }
        } catch (error) {
          console.error("Failed to fetch user API info:", error);
          setUserInfoError(error instanceof Error ? error.message : 'An unknown error occurred fetching user info');
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
          const googleIdToFetch = user?.id || '';
          const response = await fetch(`https://cartoon.framepola.com/api/generateImageOpus/list`, {
            method: 'POST',
            // headers: {
            //   'Content-Type': 'application/json',
            // },
            body: JSON.stringify({
              page: page,
              page_size: historyPageSize,
              google_id: googleIdToFetch,
            }),
          });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          const result = await response.json();

          if (result.code === 1000 && result.data) {
            setHistoryList(result.data.list || []);
            setTotalPages(result.data.total_page || 0);
            setTotalHistoryCount(result.data.count || 0);
          } else {
            console.error("Failed to fetch history:", result.msg || 'Unknown API error');
            setHistoryList([]);
            setTotalPages(0);
            setTotalHistoryCount(0);
            setHistoryError(result.msg || 'Failed to fetch generation history');
          }
        } catch (error) {
          console.error("Failed to fetch generation history:", error);
          setHistoryError(error instanceof Error ? error.message : 'An unknown error occurred fetching history');
          setHistoryList([]);
          setTotalPages(0);
          setTotalHistoryCount(0);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchGenerationHistory(currentPage);
    } else if (isLoaded && !user) {
      setIsLoadingHistory(false);
      setHistoryList([]);
      setTotalPages(0);
      setTotalHistoryCount(0);
      setHistoryError(null);
    }
  }, [isLoaded, user, currentPage]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      const historySection = document.getElementById('generation-history-section');
      if (historySection) {
        historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">{commonT('loading', { defaultMessage: 'Loading...' })}</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-6">
        <p className="text-lg mb-4">{t('loginPrompt', {defaultMessage: 'Please log in to view your profile and generation history.'})}</p>
        <Button onClick={() => window.location.href=`/${locale}/sign-in?redirect_url=/${locale}/profile`}>
          {t('loginAction', {defaultMessage: 'Log In / Sign Up'})}
        </Button>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  // 根据 API 数据计算使用率
  const usagePercentage = userApiInfo?.api_total_times && userApiInfo.api_total_times > 0
    ? (userApiInfo.api_used_times / userApiInfo.api_total_times) * 100
    : 0;

  // 获取订阅计划名称 (可以从翻译文件获取)
  const getPlanName = (level: number | undefined) => {
    switch (level) {
      case 1: return t('premiumPlan', {defaultMessage: 'Premium Plan'}); // Level 1 -> Basic
      case 2: return t('ultimatePlan', {defaultMessage: 'Ultimate Plan'}); // Level 2 -> Premium
      // case 3: return t('ultimatePlan', {defaultMessage: 'Ultimate Plan'}); // Level 3 -> Ultimate
      default: return t('noSubscription', {defaultMessage: 'No Subscription'}); // Level 0 或 undefined -> No Subscription
    }
  };
  const currentPlanName = getPlanName(userApiInfo?.level);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-10">{t('account')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-2 border-gray-100">
                <AvatarImage src={user.imageUrl} alt={user.username || 'User Avatar'} />
                <AvatarFallback className="text-3xl font-semibold bg-gray-100 text-gray-600">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-gray-800">{user.fullName || user.username}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.primaryEmailAddress?.emailAddress}</p>
            </div>

            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('subscriptionStatus', { defaultMessage: 'Subscription Status' })}</h3>
              {isLoadingUserInfo ? (
                <p className="text-gray-500">{commonT('loading', { defaultMessage: 'Loading...' })}</p>
              ) : userInfoError ? (
                <p className="text-red-600">{t('errorFetchingUserInfo', { defaultMessage: 'Error fetching user data:' })} {userInfoError}</p>
              ) : userApiInfo ? (
                userApiInfo.level > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">{t('currentPlan', { defaultMessage: 'Current Plan:' })}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${userApiInfo.level === 2 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {currentPlanName}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-600">{t('generationUsage', { defaultMessage: 'Generation Usage:' })}</span>
                        <span className="text-gray-500">{userApiInfo.api_used_times} / {userApiInfo.api_total_times}</span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">{t('noSubscriptionMessage', { defaultMessage: 'You currently do not have an active subscription.' })}</p>
                    <Button onClick={() => window.location.href=`/${locale}/#pricing`}>
                      {t('viewPlans', { defaultMessage: 'View Plans' })}
                    </Button>
                  </div>
                )
              ) : (
                <p className="text-gray-500">{t('userInfoNotAvailable', { defaultMessage: 'User subscription details not available.' })}</p>
              )}
            </div>
          </div>

          <div id="generation-history-section">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('generatedImages')}</h2>

            {isLoadingHistory ? (
              <div className="text-center py-10">
                <p className="text-gray-500">{commonT('loadingHistory', { defaultMessage: 'Loading history...' })}</p>
              </div>
            ) : historyError ? (
              <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg px-4">
                <p className="text-red-600">{t('errorFetchingHistory', { defaultMessage: 'Error loading generation history:' })} {historyError}</p>
                <Button variant="link" className="mt-2 text-red-600" onClick={() => handlePageChange(currentPage)}>
                  {t('retry', { defaultMessage: 'Retry' })}
                </Button>
              </div>
            ) : totalHistoryCount > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {historyList.map((item) => (
                    <div 
                      key={item.id} 
                      className={`group relative aspect-square overflow-hidden rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDownloading === item.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => {
                        if (isDownloading !== item.id) { // 防止在下载时再次触发
                          downloadImageWithCors(
                            item.dist_image, 
                            `polatoons-image-${item.id}.png`, 
                            setIsDownloading, 
                            item.id,
                            t // 传入翻译函数
                          )
                        }
                      }}
                      title={`${t('downloadImage', { defaultMessage: 'Download Image' })}: ${item.prompt || 'Generated Image'}`}
                      aria-label={t('downloadImageAria', { defaultMessage: 'Download generated image {id}', id: item.id })}
                    >
                      <Image
                        src={item.dist_image}
                        alt={item.prompt || `Generated Image ${item.id}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        priority={historyList.slice(0, 10).includes(item)}
                        unoptimized={true}
                      />
                      {isDownloading === item.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }}
                            aria-disabled={currentPage <= 1}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : undefined}
                          />
                        </PaginationItem>

                        {getPaginationItems(currentPage, totalPages).map((page, index) => (
                          <PaginationItem key={index}>
                            {typeof page === 'number' ? (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            ) : (
                              <PaginationEllipsis />
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }}
                            aria-disabled={currentPage >= totalPages}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 mb-4">{t('noImagesYet', {defaultMessage: 'You haven\'t generated any images yet.'})}</p>
                <Button variant="default" onClick={() => window.location.href=`/${locale}/`}>
                  {t('generateFirstImage', {defaultMessage: 'Create your first image'})}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 