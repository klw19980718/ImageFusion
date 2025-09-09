"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Upload, X, Download, Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Progress } from "./ui/progress";
import { api } from "@/app/config/api";
import { useToast } from "@/components/ui/toast-provider";

// 下载图片函数
async function downloadImageWithCors(
  imageUrl: string,
  filename: string,
  setIsDownloading: (isDownloading: boolean) => void,
  t: Function
): Promise<void> {
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
    link.download = filename || `nano-banana-result.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    console.log("Image download initiated!");
  } catch (error: any) {
    console.error("Download failed:", error);
    throw error;
  } finally {
    setIsDownloading(false);
  }
}

// 任务状态接口
interface TaskStatusData {
  task_id: string;
  status: number; // 0 generating, 1 success, -1 failed
  status_msg: string;
  image_url?: string;
  progress: string;
}

// 展示状态类型
type DisplayState = 'demo' | 'loading' | 'result';

export default function HeroSection() {
  const t = useTranslations("home");
  const params = useParams();
  const currentLocale = (params.locale as string) || "zh";
  const isZh = currentLocale === "zh";
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const toast = useToast();

  // 表单状态
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");
  const [imageSize, setImageSize] = useState<"auto" | "1:1" | "3:4" | "9:16" | "4:3" | "16:9">("auto");

  // 生成状态
  const [displayState, setDisplayState] = useState<DisplayState>('demo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 停止生成过程
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

  // 清理函数
  useEffect(() => {
    return () => {
      stopGenerationProcess();
    };
  }, []);

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 检查登录状态
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - uploadedImages.length);
      const updatedFiles = [...uploadedImages, ...newFiles];
      setUploadedImages(updatedFiles);
      
      // 为每个文件创建预览URL
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);
      
      toast.success(`Uploaded ${newFiles.length} image(s) successfully!`);
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    const updatedFiles = uploadedImages.filter((_, i) => i !== index);
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    
    // 释放被删除图片的URL
    URL.revokeObjectURL(imageUrls[index]);
    
    setUploadedImages(updatedFiles);
    setImageUrls(updatedUrls);
  };

  // 上传图片到服务器
  const uploadImagesToServer = async (): Promise<string[]> => {
    const uploadPromises = uploadedImages.map(async (file) => {
      const result = await api.image.uploadImage(file);
      if (result.code !== 200 || !result.data) {
        throw new Error(`Failed to upload image: ${result.msg}`);
      }
      return result.data;
    });
    
    return Promise.all(uploadPromises);
  };

  // 开始生成
  const startGeneration = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!prompt.trim()) {
      toast.info("Please enter a prompt");
      return;
    }

    if (uploadedImages.length === 0) {
      toast.info("Please upload at least one image");
      return;
    }

    setIsGenerating(true);
    setDisplayState('loading');
    setGenerationProgress(0);
    setResultImage(null);

    // 开始进度模拟
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const totalSimulationTime = 40 * 1000; // 40秒
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
      // 1. 上传图片到服务器
      console.log("Uploading images to server...");
      const uploadedImageUrls = await uploadImagesToServer();
      console.log("Images uploaded successfully:", uploadedImageUrls);

      // 2. 创建生成任务
      console.log("Creating generation task...");
      const taskResult = await api.image.createNanoBananaTask({
        prompt: prompt.trim(),
        image_urls: uploadedImageUrls,
        output_format: outputFormat,
        image_size: imageSize,
      });

      if (!taskResult.data?.task_id) {
        throw new Error("Failed to create generation task - no task ID returned");
      }

      const taskId = taskResult.data.task_id;
      console.log("Generation task started. Task ID:", taskId);
      setCurrentTaskId(taskId);

    } catch (error) {
      console.error("Generation process failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred during task creation.";
      toast.error(errorMsg);
      stopGenerationProcess();
      setDisplayState('demo');
    }
  };

  // 轮询任务状态
  useEffect(() => {
    if (currentTaskId && isGenerating) {
      const pollTaskStatus = async () => {
        console.log(`Checking task status: ${currentTaskId}`);
        try {
          const checkResult = await api.image.checkNanoBananaTaskStatus(currentTaskId);

          if (checkResult.code === 200 && checkResult.data) {
            const statusData = checkResult.data;

            if (statusData.status === 1 && statusData.image_url) {
              // 成功：任务完成
              console.log("Polling: Task completed!", statusData.image_url);
              setGenerationProgress(100);
              setResultImage(statusData.image_url);
              setDisplayState('result');
              toast.success("Image generation completed successfully!");
              
              // 停止生成过程
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
            } else if (statusData.status === 0) {
              // 进行中：继续轮询
              console.log("Polling: Task in progress...");
              if (pollingTimeoutRef.current)
                clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = setTimeout(pollTaskStatus, 2000);
            } else {
              // 失败：任务失败
              console.error("Polling: Task failed, status:", statusData.status);
              const errorMsg = statusData.status_msg || "Image generation failed.";
              toast.error(errorMsg);
              stopGenerationProcess();
              setDisplayState('demo');
            }
          } else {
            // 失败：检查API错误
            console.error("Check API returned unexpected response.");
            const errorMsg = checkResult.msg || "Check API returned unexpected response.";
            toast.error(errorMsg);
            stopGenerationProcess();
            setDisplayState('demo');
          }
        } catch (error) {
          console.error("Polling failed:", error);
          const errorMsg = error instanceof Error ? error.message : "Unknown error occurred during polling.";
          toast.error(errorMsg);
          stopGenerationProcess();
          setDisplayState('demo');
        }
      };
      pollTaskStatus();

      return () => {
        console.log("Cleaning up task polling:", currentTaskId);
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
      };
    }
  }, [currentTaskId, isGenerating]);

  // 下载结果图片
  const handleDownloadClick = async () => {
    if (!resultImage || isDownloading) return;

    const fileName = `nano-banana-result.${outputFormat}`;
    
    try {
      await downloadImageWithCors(resultImage, fileName, setIsDownloading, t);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    setDisplayState('demo');
    setResultImage(null);
    setGenerationProgress(0);
  };

  return (
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 左侧输入区域 - 40% */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  {isZh ? "输入设置" : "Input Settings"}
                </h2>

                {/* Prompt 输入 */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    {isZh ? "提示词" : "Prompt"}
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => {
                      // 检查登录状态
                      if (!isSignedIn) {
                        openSignIn();
                        return;
                      }
                      setPrompt(e.target.value);
                    }}
                    placeholder={isZh ? "描述你想要的效果..." : "Describe the effect you want..."}
                    className="w-full h-24 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder:text-zinc-400 resize-none focus:ring-0 focus-visible:outline-none p-3"
                  />
                </div>

                {/* 图片上传区域 */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    {isZh ? "上传图片" : "Upload Images"} ({uploadedImages.length}/5)
                  </label>
                  
                  {/* 上传按钮 */}
                  <div
                    className="border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center cursor-pointer hover:border-yellow-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm">
                      {isZh ? "点击上传图片 (最多5张)" : "Click to upload images (max 5)"}
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp, image/bmp"
                    multiple
                  />

                  {/* 图片预览 */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={url}
                            alt={`Uploaded image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 输出格式选择 */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    {isZh ? "输出格式" : "Output Format"}
                  </label>
                  <div className="flex gap-2">
                    {(['png', 'jpeg'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={outputFormat === format ? "default" : "outline"}
                        className={`flex-1 ${outputFormat === format 
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black" 
                          : "border-zinc-600 text-white hover:bg-zinc-700"
                        }`}
                        onClick={() => setOutputFormat(format)}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 图片尺寸选择 */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    {isZh ? "图片尺寸" : "Image Size"}
                  </label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as typeof imageSize)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md text-white p-3 focus:ring-0 focus-visible:outline-none"
                  >
                    <option value="auto">Auto</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="3:4">3:4 (Portrait)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="4:3">4:3 (Landscape)</option>
                    <option value="16:9">16:9 (Wide)</option>
                  </select>
                </div>

                {/* 生成按钮 */}
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md"
                  onClick={startGeneration}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isZh ? "生成中..." : "Generating..."}
                    </>
                  ) : (
                    isZh ? "立即生成" : "Generate Now"
                  )}
                </Button>
              </div>
            </div>

            {/* 右侧展示区域 - 60% */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  {isZh ? "生成结果" : "Generation Result"}
                </h2>

                <div className="h-[500px] relative overflow-hidden rounded-lg border border-zinc-600 flex items-center justify-center">
                  {displayState === 'demo' && (
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-4 bg-zinc-700 rounded-full flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-yellow-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {isZh ? "图片将在这里生成" : "Images will be generated here"}
                      </h3>
                      <p className="text-zinc-400">
                        {isZh ? "上传图片并输入提示词，然后点击生成按钮开始创作" : "Upload images and enter a prompt, then click generate to start creating"}
                      </p>
                    </div>
                  )}

                  {displayState === 'loading' && (
                    <div className="flex flex-col items-center justify-center h-full w-full p-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-6"></div>
                      <p className="text-xl text-white text-center mb-4">
                        {isZh ? "AI正在生成中..." : "AI is generating..."}
                      </p>
                      <Progress
                        value={generationProgress}
                        className="w-full h-3 bg-zinc-700 mb-2"
                      />
                      <p className="text-sm text-zinc-400">
                        {generationProgress}%
                      </p>
                    </div>
                  )}

                  {displayState === 'result' && resultImage && (
                    <div className="relative w-full h-full">
                      <Image
                        src={resultImage}
                        alt="Generated result"
                        fill
                        className="object-contain rounded-md"
                      />
                      {/* 下载按钮 */}
                      <Button
                        className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full w-10 h-10 p-0 shadow-lg"
                        onClick={handleDownloadClick}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      {/* 重新生成按钮 */}
                      <Button
                        variant="outline"
                        className="absolute bottom-4 right-4 bg-black/70 border-zinc-600 text-white hover:bg-zinc-700"
                        onClick={handleRegenerate}
                      >
                        {isZh ? "重新生成" : "Regenerate"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}