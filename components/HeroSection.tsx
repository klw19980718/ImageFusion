"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Upload, ImageIcon, MessageSquare, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import imgFusionTemplates from "@/app/config/styles";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { Progress } from "./ui/progress";
import { apiConfig } from "@/app/config/api";

// --- localStorage Key ---
const CACHED_SOURCE_IMAGE_KEY = "cachedSourceImage";

// --- Helper function to convert Base64 back to File ---
async function base64ToFile(dataUrl: string, filename: string, type: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type });
}

// 下载图片函数
async function downloadImageWithCors(
  imageUrl: string,
  filename: string,
  setIsDownloading: (isDownloading: boolean) => void,
  t: Function
) {
  setIsDownloading(true);
  try {
    const response = await fetch(imageUrl, { mode: "cors" });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}. Failed to fetch image.`
      );
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || `imagefusion-result.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    console.log("Image download initiated!");
  } catch (error: any) {
    console.error("Download failed:", error);
    const errorMessage = t("downloadFailed", { defaultMessage: "下载失败！" });
    const corsMessage = t("downloadCorsError", {
      defaultMessage:
        "无法从 {imageUrl} 获取图像。这通常是由于服务器缺少CORS头 (Access-Control-Allow-Origin)。",
      imageUrl: imageUrl,
    });
    const genericMessage = t("downloadGenericError", {
      defaultMessage: "错误: {errorMsg}",
      errorMsg: error.message,
    });

    if (
      error.message.includes("Failed to fetch") ||
      error.name === "TypeError"
    ) {
      alert(`${errorMessage}\n\n${corsMessage}`);
    } else {
      alert(`${errorMessage} ${genericMessage}`);
    }
  } finally {
    setIsDownloading(false);
  }
}

// 定义接口
interface CheckStatusData {
  opsuinfo: {
    id: number;
    google_id: string;
    task_id: string;
    prompt: string;
    origin_image: string;
    dist_image: string;
    size: string;
    is_enhance: number;
    status: number;
    created: number;
    updated: number;
  } | null;
  status: number;
  status_msg: string;
}

export default function HeroSection() {
  const t = useTranslations("home");
  const params = useParams();
  const currentLocale = (params.locale as string) || "zh";
  const isZh = currentLocale === "zh";
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState<number>(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [stylePopoverOpen, setStylePopoverOpen] = useState(false);
  const [promptPopoverOpen, setPromptPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [customStyleImage, setCustomStyleImage] = useState<File | null>(null);
  const [isUserUploadedSource, setIsUserUploadedSource] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(true); // State to track cache loading

  // 添加生成和下载相关状态
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCheckingLevel, setIsCheckingLevel] = useState(false);

  // Refs for intervals and timeouts
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 停止所有生成过程的辅助函数
  const stopGenerationProcess = () => {
    setIsGenerating(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setCurrentTaskId(null);
    setGenerationProgress(0);
  };

  // --- Effect for Initial Load (Cache or Default) ---
  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component
    setIsLoadingCache(true);

    const loadInitialSource = async () => {
      try {
        const cachedImageData = localStorage.getItem(CACHED_SOURCE_IMAGE_KEY);
        if (cachedImageData) {
          console.log("Found cached image data.");
          const { dataUrl, name, type } = JSON.parse(cachedImageData);
          if (dataUrl && name && type) {
            const file = await base64ToFile(dataUrl, name, type);
            if (isMounted) {
              setSourceImage(file);
              setIsUserUploadedSource(true);
              console.log("Loaded image from cache.");
            }
          } else {
            console.warn("Cached image data is incomplete, falling back to default.");
            localStorage.removeItem(CACHED_SOURCE_IMAGE_KEY); // Clear invalid cache
            if (isMounted) loadDefaultExample();
          }
        } else {
          console.log("No cached image found, loading default.");
          if (isMounted) loadDefaultExample();
        }
      } catch (error) {
        console.error("Error loading cached image:", error);
        localStorage.removeItem(CACHED_SOURCE_IMAGE_KEY); // Clear potentially corrupted cache
        if (isMounted) loadDefaultExample(); // Fallback to default on error
      } finally {
        if (isMounted) setIsLoadingCache(false);
      }
    };

    loadInitialSource();

    // Cleanup function
    return () => {
      isMounted = false;
      stopGenerationProcess();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // 加载默认示例图片 (Now only called as fallback)
  const loadDefaultExample = () => {
    console.log("Loading default example image...");
    const defaultSourceImg = "/images/templates/Magical Princess/new_source.png";
    fetch(defaultSourceImg)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `default-example-source.jpg`, { type: "image/jpeg" });
        // Check if component is still mounted before setting state
        // This check might be redundant if called from the mount effect's final block, but good practice
        setSourceImage(file);
        setIsUserUploadedSource(false); 
      }).catch(error => {
        console.error("Failed to load default example image:", error);
        // Handle error, maybe set sourceImage to null or show an error placeholder
      });
  };

  // --- Helper to Cache File --- 
  const cacheSourceFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dataUrl = e.target?.result as string;
        const cacheData = JSON.stringify({ dataUrl, name: file.name, type: file.type });
        localStorage.setItem(CACHED_SOURCE_IMAGE_KEY, cacheData);
        console.log("Cached source image.");
      } catch (error) {
        console.error("Failed to cache source image:", error);
        // Optionally inform the user or clear potentially corrupted cache
        localStorage.removeItem(CACHED_SOURCE_IMAGE_KEY);
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error while caching:", error);
    };
    reader.readAsDataURL(file);
  };

  // 处理文件选择 (Add Caching)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSourceImage(file);
      setIsUserUploadedSource(true);
      setResultImage(null);
      cacheSourceFile(file); // Cache the uploaded file
    }
  };

  const handleUploadClick = () => {
    sourceInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 处理文件拖放 (Add Caching)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSourceImage(file);
      setIsUserUploadedSource(true);
      setResultImage(null);
      cacheSourceFile(file); // Cache the dropped file
    }
  };

  const selectStyle = (index: number) => {
    setSelectedStyleIndex(index);
    setIsPromptMode(false);
    setCustomStyleImage(null);
    setResultImage(null);
    setStylePopoverOpen(false);
  };

  const enablePromptMode = () => {
    setIsPromptMode(true);
    setResultImage(null);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const disablePromptMode = () => {
    setIsPromptMode(false);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  };

  const handleStyleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCustomStyleImage(files[0]);
      setIsPromptMode(false);
      setResultImage(null);
    }
  };

  const handleStyleUploadClick = () => {
    styleInputRef.current?.click();
  };

  // 下载结果图片
  const handleDownloadClick = () => {
    if (!resultImage || isDownloading) return;

    const fileName = resultImage.split("/").pop() || "imagefusion-result.png";
    downloadImageWithCors(resultImage, fileName, setIsDownloading, t);
  };

  // 新增：实际API调用生成图片过程
  const startImageGeneration = async () => {
    setIsCheckingLevel(false);
    setIsGenerating(true);
    setResultImage(null);
    setCurrentTaskId(null);
    setGenerationProgress(0);
    setApiError(null);

    // 构建FormData
    const formData = new FormData();
    // 更新参数名称为最新API格式
    formData.append("origin_img", sourceImage!);

    // 必须添加风格图片
    if (customStyleImage) {
      formData.append("style_img", customStyleImage);
    } else {
      // 如果没有自定义风格图，则需要从预设风格中获取一个图片
      try {
        const styleSrc = imgFusionTemplates[selectedStyleIndex].imageSrc;
        const styleResponse = await fetch(styleSrc);
        const styleBlob = await styleResponse.blob();
        const styleFile = new File([styleBlob], "style-image.jpg", {
          type: "image/jpeg",
        });
        formData.append("style_img", styleFile);
      } catch (error) {
        console.error("获取风格图失败:", error);
        setApiError("无法获取风格图，请上传自定义风格图或重试");
        stopGenerationProcess();
        setIsCheckingLevel(false);
        return;
      }
    }

    const googleId = user?.id || "";
    formData.append("google_id", googleId);

    // 构建合适的提示词
    const basePrompt = imgFusionTemplates[selectedStyleIndex].prompt;

    const customStylePrompt = "将图2的关键风格特征融合到图片1上面";

    if (customStyleImage) {
      // 如果使用了自定义风格图片，则使用自定义风格的默认提示词
      formData.append("prompt", customStylePrompt);
    } else {
      // 如果没有提示词或不是提示词模式，使用默认提示词
      formData.append("prompt", basePrompt);
    }

    // 设置尺寸比例，使用1:1固定值
    formData.append("size", "2:3");

    // 增强选项，这里使用boolean值false
    formData.append("is_enhance", "false");

    // 启动进度模拟
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const totalSimulationTime = 110 * 1000;
    const intervals = 95;
    const intervalDuration = totalSimulationTime / intervals;

    progressIntervalRef.current = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) {
          if (progressIntervalRef.current)
            clearInterval(progressIntervalRef.current);
          return 95;
        }
        return prev + 1;
      });
    }, intervalDuration);

    try {
      const response = await fetch(apiConfig.generateImage, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `API错误: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.msg) {
            if (errorData.code === 1003) {
              errorMsg = t("error.insufficientCredits", {
                defaultMessage: "可用配额不足。",
              });
            } else {
              errorMsg = errorData.msg;
            }
          }
        } catch (e) {
          /* 忽略JSON解析错误 */
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (
        result.code === 1000 &&
        typeof result.data === "string" &&
        result.data.length > 0
      ) {
        const taskId = result.data;
        console.log("生成任务已启动。任务ID:", taskId);
        setCurrentTaskId(taskId); // 启动轮询
      } else {
        let errorMessage =
          result.msg ||
          t("error.genericGeneration", {
            defaultMessage: "创建生成任务失败。",
          });
        if (result.code === 1003) {
          errorMessage = t("error.insufficientCredits", {
            defaultMessage: "可用配额不足。",
          });
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("生成过程中失败:", error);
      setApiError(
        error instanceof Error ? error.message : "任务创建过程中发生未知错误。"
      );
      stopGenerationProcess();
    }
  };

  // 生成融合图片 - 修改为调用API
  const generateImage = async () => {
    if (!sourceImage || isGenerating) return;

    // 检查登录状态
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    setIsCheckingLevel(true);
    setApiError(null);

    try {
      // 实际API调用
      await startImageGeneration();
    } catch (error) {
      console.error("检查用户等级或启动生成失败:", error);
      setApiError(error instanceof Error ? error.message : "发生未知错误。");
      setIsCheckingLevel(false);
    }
  };

  // 添加轮询逻辑
  useEffect(() => {
    if (currentTaskId && isGenerating) {
      const pollTaskStatus = async () => {
        console.log(`检查任务状态: ${currentTaskId}`);
        try {
          const checkResponse = await fetch(
            `${apiConfig.checkStatus}?task_id=${currentTaskId}`
          );

          if (!checkResponse.ok) {
            throw new Error(
              `检查API错误: ${checkResponse.status} ${checkResponse.statusText}`
            );
          }

          const checkResult = await checkResponse.json();

          if (checkResult.code === 1000 && checkResult.data) {
            const statusData = checkResult.data as CheckStatusData;

            if (statusData.status === 1 && statusData.opsuinfo?.dist_image) {
              // 成功：任务完成
              console.log("轮询: 任务完成!", statusData.opsuinfo.dist_image);
              setGenerationProgress(100);
              setResultImage(statusData.opsuinfo.dist_image);
              setApiError(null);
              stopGenerationProcess();
            } else if (statusData.status === 0) {
              // 待处理：任务仍在处理中，继续轮询
              console.log("轮询: 任务处理中...");
              if (pollingTimeoutRef.current)
                clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = setTimeout(pollTaskStatus, 20000); // 20秒后再次轮询
            } else {
              // 失败：根据API状态任务失败
              console.error("轮询: 任务失败，状态:", statusData.status);
              setApiError(statusData.status_msg || "图像生成失败。");
              setResultImage(null);
              stopGenerationProcess();
            }
          } else {
            // 失败：检查API错误
            console.error("检查API返回意外响应。");
            setApiError(checkResult.msg || "检查API返回意外响应。");
            setResultImage(null);
            stopGenerationProcess();
          }
        } catch (error) {
          console.error("轮询失败:", error);
          setApiError(
            error instanceof Error ? error.message : "轮询过程中发生未知错误。"
          );
          setResultImage(null);
          stopGenerationProcess();
        }
      };
      pollTaskStatus();

      return () => {
        console.log("清理任务轮询:", currentTaskId);
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
      };
    }
  }, [currentTaskId, isGenerating]);

  // Display loading state while checking cache
  if (isLoadingCache) {
    return (
      <section id="hero" className="pt-24 pb-20 md:pt-28 md:pb-28 bg-gradient-to-b from-black to-zinc-900 relative overflow-hidden min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] bg-center opacity-20"></div>
        <div className="text-center z-10">
          <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-white">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="hero" className="pt-24 pb-20 md:pt-28 md:pb-28 bg-gradient-to-b from-black to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] bg-center opacity-20"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
          <div className="text-center mb-16 max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-8 px-4">
              {t("description")}
            </p>
          </div>

          <div className="mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8">
              {/* Source区域 */}
              <div className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("sourceLabel")}
                </h2>
                <div className="bg-zinc-800 p-4 md:p-5 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* 统一增加最小高度 */}
                  <div className="aspect-[3/4] min-h-[400px] relative overflow-hidden rounded-lg border border-zinc-600">
                    {!sourceImage ? (
                      <div
                        className="flex flex-col items-center justify-center h-full cursor-pointer p-4"
                        onClick={handleUploadClick}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <Upload className="h-12 w-12 text-yellow-500 mb-4" /> 
                        <p className="text-lg text-white text-center">
                          {t("dragDropText")}
                        </p>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={URL.createObjectURL(sourceImage)}
                          alt="Source image"
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={sourceInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp, image/bmp"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full border-zinc-600 text-white hover:bg-zinc-700 rounded-md"
                  onClick={handleUploadClick}
                >
                  {t("chooseFile")}
                </Button>
              </div>

              {/* 加号连接 */}
              <div className="md:col-span-1 flex items-center justify-center">
                <div className="flex items-center justify-center">
                  <div className="bg-zinc-800 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-yellow-500"
                    >
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Style区域 */}
              <div className="md:col-span-4">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("styleLabel")}
                </h2>
                <div className="bg-zinc-800 p-4 md:p-5 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* 统一增加最小高度 */}
                  <div className="aspect-[3/4] min-h-[400px] relative overflow-hidden rounded-lg border border-zinc-600">
                    {isPromptMode ? (
                      <div className="h-full w-full flex items-center justify-center bg-zinc-700 rounded-lg p-1">
                        <Textarea
                          ref={textareaRef}
                          value={promptText}
                          onChange={handlePromptChange}
                          placeholder={t("promptPlaceholder")}
                          className="w-full h-full bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder:text-zinc-400 resize-none focus:ring-0 focus-visible:outline-none p-2"
                        />
                      </div>
                    ) : customStyleImage ? (
                      <>
                        <Image
                          src={URL.createObjectURL(customStyleImage)}
                          alt="Custom style image"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-2 px-3">
                          <p className="text-white text-sm font-medium">
                            {isZh ? "自定义风格" : "Custom Style"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Image
                          src={imgFusionTemplates[selectedStyleIndex].imageSrc}
                          alt={imgFusionTemplates[selectedStyleIndex].name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-2 px-3">
                          <p className="text-white text-sm font-medium">
                            {imgFusionTemplates[selectedStyleIndex].name}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* 风格选择按钮（弹窗） */}
                  <Popover
                    open={stylePopoverOpen}
                    onOpenChange={setStylePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full border-zinc-600 ${!isPromptMode && !customStyleImage ? "bg-zinc-700 text-yellow-500" : "text-white hover:bg-zinc-700"
                          } flex items-center justify-center gap-2 rounded-md`}
                        onClick={disablePromptMode}
                      >
                        <ImageIcon className="h-4 w-4" />
                        {t("chooseStyle")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-96 md:w-[580px] max-w-[90vw] p-4 bg-zinc-800 border border-zinc-600"
                    >
                      <h3 className="text-white text-sm font-medium mb-3">
                        {t("selectStyle")}
                      </h3>
                      <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-1">
                        {imgFusionTemplates.map((style, index) => (
                          <div
                            key={index}
                            className={`aspect-square relative overflow-hidden rounded-md cursor-pointer
                              ${
                                selectedStyleIndex === index &&
                                !isPromptMode &&
                                !customStyleImage
                                  ? "ring-2 ring-yellow-500"
                                  : "opacity-80 hover:opacity-100"
                              }`}
                            onClick={() => selectStyle(index)}
                          >
                            <Image
                              src={style.imageSrc}
                              alt={style.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* 上传风格图片按钮 */}
                  <Button
                    variant="outline"
                    className={`w-full border-zinc-600 ${customStyleImage ? "bg-zinc-700 text-yellow-500" : "text-white hover:bg-zinc-700"
                      } flex items-center justify-center gap-2 rounded-md`}
                    onClick={handleStyleUploadClick}
                  >
                    <Upload className="h-4 w-4" />
                    {isZh ? "上传风格" : "Upload Style"}
                  </Button>

                  {/* 隐藏的风格图片上传输入框 */}
                  <input
                    type="file"
                    ref={styleInputRef}
                    onChange={handleStyleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp, image/bmp"
                  />
                </div>
              </div>

              {/* 加号和箭头 */}
              <div className="md:col-span-1 flex items-center justify-center">
                <div className="flex md:flex-col items-center gap-4">
                  <div className="hidden bg-zinc-800 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-yellow-500"
                    >
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                  </div>
                  <div className="bg-zinc-800 rounded-full p-2 rotate-90 md:rotate-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-yellow-500"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 结果区域 */}
              <div className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("resultLabel")}
                </h2>
                <div className="bg-zinc-800 p-4 md:p-5 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* 统一增加最小高度 */}
                  <div className="aspect-[3/4] min-h-[400px] relative overflow-hidden rounded-lg border border-zinc-600 flex flex-col items-center justify-center">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full w-full p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                        <p className="text-lg text-white text-center mb-4">
                          {t("generatingText")}
                        </p>
                        {/* 添加进度条 */}
                        <Progress
                          value={generationProgress}
                          className="w-full h-2 bg-zinc-700"
                        />
                        <p className="text-sm text-zinc-400 mt-2">
                          {generationProgress}%
                        </p>
                      </div>
                    ) : resultImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={resultImage}
                          alt="Result image"
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <p className="text-lg text-white text-center mb-2">
                          {t("clickToGenerate")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 根据状态调整按钮布局 */}
                {resultImage ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md"
                      onClick={generateImage}
                      disabled={!sourceImage || isGenerating || isCheckingLevel}
                    >
                      {isCheckingLevel ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isZh ? "检查中..." : "Checking..."}
                        </>
                      ) : isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("generatingText")}
                        </>
                      ) : (
                        t("generateButton")
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="border-zinc-600 text-white hover:bg-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDownloadClick}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isZh ? "下载中..." : "Downloading..."}
                        </>
                      ) : isZh ? (
                        "下载结果"
                      ) : (
                        "Download"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <Button
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md w-full"
                      onClick={generateImage}
                      disabled={!sourceImage || isGenerating || isCheckingLevel}
                    >
                      {isCheckingLevel ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isZh ? "检查中..." : "Checking..."}
                        </>
                      ) : isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("generatingText")}
                        </>
                      ) : (
                        t("generateButton")
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 添加错误提示 */}
            {apiError && (
              <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-white text-center max-w-2xl mx-auto">
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
