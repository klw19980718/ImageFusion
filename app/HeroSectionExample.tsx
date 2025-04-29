'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from './ui/button';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Progress } from "./ui/progress";
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, X, Loader2, Square, RectangleHorizontal, RectangleVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import React from 'react';

// Define the structure for the opsuinfo part of the check response
interface OpsuInfo {
  id: number;
  google_id: string;
  task_id: string;
  prompt: string;
  origin_image: string;
  dist_image: string; // Final image URL
  size: string;
  is_enhance: number;
  status: number;
  created: number;
  updated: number;
}

// Define the structure for the data part of the check response
interface CheckStatusData {
  opsuinfo: OpsuInfo | null;
  status: number; // 0: pending, 1: success, <0: failed
  status_msg: string;
}

// --- 更新 Styles 数据 ---
const styles = [
  {
    value: 'iced_coffee_polaroid', // Updated key
    labelKey: 'styles.icedCoffeePolaroid',
    prompt: 'A cute, stylized 3D character, The character\'s hairstyle, clothing, and overall appearance must match the photo. reference and holding an iced coffee. The character playfully sits on the edge of a Polaroid-style photo frame, with one leg dangling outside. The background features a soft scenic view, and the hand holding the photo wears a butterfly bracelet. The character has a cheerful, expressive face that adds to the playful vibe. ultra high definition, vivid colors, modern clean lighting, realistic camera depth, no vintage effects, no paper texture, looks like a professional photo with cartoon details.',
    imageSrc: '/type/type1.png' // Keep existing image for now
  },
  {
    value: 'travel_photo_polaroid', // New
    labelKey: 'styles.travelPhotoPolaroid',
    prompt: 'Create a cute, stylized 3D character based on the photo above. The character\'s pose, skin color, hairstyle, clothing, and overall appearance must match the photo. The character should have a lively personality. A Polaroid-style frame with ["TRAVEL"] written on the bottom, with the character leaning out of the frame to create a 3D visual effect. The background refers to the background in the original photo. ultra high definition, vivid colors, modern clean lighting, realistic camera depth, no vintage effects, no paper texture, looks like a professional photo with cartoon details.',
    imageSrc: '/type/type2.png' // Placeholder image
  },
  {
    value: 'fitness_instagram_polaroid', // Updated key
    labelKey: 'styles.fitnessInstagramPolaroid',
    prompt: 'Create a dynamic 3D diorama blending fitness and social media. Feature a cream [Instagram] frame displaying a lush outdoor running path. A realistic 3D runner (black athletic wear, mid-stride) bursts from the frame, surrounded by glowing reaction icons (thumbs-up, heart eyes, comment bubble, red heart). Below, stylized engagement stats (6K♥, 20k💬, 30k📥). Mount on a wooden base with floating leaves and foliage.',
    imageSrc: '/type/type3.png' // Keep existing image for now
  },
  {
    value: 'disney_3d_polaroid', // Updated key
    labelKey: 'styles.disney3dPolaroid',
    prompt: 'A cute Disney-inspired 3D character, The character\'s hairstyle, clothing, and overall appearance must match the photo. The character sits on the edge of a Polaroid frame surrounded by soft spring blossoms and pastel sparkles. Cheerful expression.',
    imageSrc: '/type/type4.png' // Keep existing image for now
  },
  {
    value: 'lego_3d_polaroid', // Updated key
    labelKey: 'styles.lego3dPolaroid',
    prompt: 'A cute Lego-style 3D character whose hairstyle, clothing, and overall appearance must match the original photo, stepping out of a Polaroid frame. ultra high definition, vivid colors, modern clean lighting, realistic camera depth, no vintage effects, no paper texture, looks like a professional photo with cartoon details.',
    imageSrc: '/type/type5.png' // Keep existing image for now
  },
  {
    value: 'peeking_instagram_polaroid', // New
    labelKey: 'styles.peekingInstagramPolaroid',
    prompt: 'Create a 3D cartoon-style illustration. The characters peeking out of the frame of an Instagram post, as if she were a social media character. The characters is dressed the same as in the provided photo (clothes, hairstyle, accessories). The background is like in the photo. The characters are joyful, sweet, with wide eyes and a smile. The profile name is indicated in the frame: @polaToons. Add Instagram-style "like", "comment" and "send" icons. A hand holds the frame.',
    imageSrc: '/type/type6.png' // Placeholder image
  },
  {
    value: 'tiktok_selfie_polaroid', // New
    labelKey: 'styles.tiktokSelfiePolaroid',
    prompt: 'Create a 3D illustration in the style of a Pixar animated doll. The doll should have a face & features based on the provided photo & look cheerful and flirty. the character sitting on a box with the TikTok logo, wearing base on the photo attached. On the one hand, she\'s holding a cell phone and posing as if taking a selfie. Behind her, there\'s a large cell phone screen showing her TikTok profile.With the username (@polaToons), this name should be easily changeable.',
    imageSrc: '/type/type7.png' // Placeholder image
  },
  {
    value: 'social_presence_polaroid', // New
    labelKey: 'styles.socialPresencePolaroid',
    prompt: 'Create a stylish 3D character based on the reference photo provided. Outfit: Orange T-shirt with ["PolaToons"] embossed in light purple, light purple shorts, and cream sneakers. Keep the original facial features and casual fashion style. Pose: Sitting cross-legged on the edge of an Instagram frame. Left hand holding a Starbucks coffee cup, right hand holding a gold iPhone.',
    imageSrc: '/type/type8.png' // Placeholder image
  }
];

// --- Define SVG Icons for Ratios (Increased size slightly) ---
const RatioIcon1x1 = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
    <rect x="2" y="2" width="16" height="16" rx="2" />
  </svg>
);
const RatioIcon3x2 = () => (
  <svg viewBox="0 0 20 20" width="20" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
    <rect x="1" y="4" width="18" height="12" rx="2" />
  </svg>
);
const RatioIcon2x3 = () => (
  <svg viewBox="0 0 20 20" width="14" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
    <rect x="4" y="1" width="12" height="18" rx="2" />
  </svg>
);

// Helper to get icon based on value
const getRatioIcon = (value: string) => {
  switch (value) {
    case "1:1": return <RatioIcon1x1 />;
    case "3:2": return <RatioIcon3x2 />;
    case "2:3": return <RatioIcon2x3 />;
    default: return null;
  }
};

// Updated aspectRatios data (no icon component needed here now)
const aspectRatios = [
    { value: "1:1", label: "1:1" },
    { value: "3:2", label: "3:2" },
    { value: "2:3", label: "2:3" },
  ];

// --- 将下载逻辑定义为独立函数 (Adapted for HeroSection) ---
async function downloadImageWithCors(
  imageUrl: string,
  filename: string,
  setIsDownloading: (isDownloading: boolean) => void, // 用于更新加载状态 (boolean for single image)
  t: Function // 翻译函数
) {
  setIsDownloading(true); // 开始下载，设置加载状态
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
    link.download = filename || `polatoons-generated-image.png`; // Default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. 释放 Object URL 资源
    URL.revokeObjectURL(objectUrl);

    console.log('Image download initiated!');

  } catch (error: any) {
    console.error('Download failed:', error);
    // 使用翻译函数 t 显示错误信息 (use appropriate keys if different from profile)
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
    setIsDownloading(false); // 结束下载，清除加载状态
  }
}

export default function HeroSection() {
  const t = useTranslations('home');
  const tUpload = useTranslations('home.uploadOptions');
  const params = useParams();
  const currentLocale = params.locale as string || 'zh';
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Remains true during polling
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null); // New state for task ID
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null); // For initial progress simulation
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For polling timeout

  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("2:3");
  const [isEnhanced, setIsEnhanced] = useState(false);
  // --- 新增：下载状态 --- 
  const [isDownloadingGeneratedImage, setIsDownloadingGeneratedImage] = useState(false);
  const [isCheckingLevel, setIsCheckingLevel] = useState(false); // New state for level check
  const [selectedStyleValue, setSelectedStyleValue] = useState<string>(styles[0].value);
  const [styleComboboxOpen, setStyleComboboxOpen] = useState(false);
  const [promptInput, setPromptInput] = useState<string>("");

  // --- Helper to stop all timers and reset generating state --- 
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
    setCurrentTaskId(null); // Reset task ID
    setGenerationProgress(0); // Reset progress
  };

  // --- 初始化或当风格改变时，更新 promptInput --- 
  useEffect(() => {
    const selectedStyle = styles.find(s => s.value === selectedStyleValue);
    if (selectedStyle) {
      setPromptInput(selectedStyle.prompt); // 自动填充默认 prompt
    }
  }, [selectedStyleValue]); // 依赖于风格选择

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Reset everything if a new file is selected
      setGeneratedImageUrl(null);
      setApiError(null);
      stopGenerationProcess();
    }
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setGeneratedImageUrl(null);
    setApiError(null);
    stopGenerationProcess(); // Stop everything on delete
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      // Reset everything on drop
      setGeneratedImageUrl(null);
      setApiError(null);
      stopGenerationProcess();
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Element with id "${id}" not found for scrolling.`);
    }
  };

  // --- Refactored handleGenerateClick ---
  const handleGenerateClick = async () => {
    // 1. Check login
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    // 2. Check if a file is selected or already generating/checking
    if (!selectedFile || isGenerating || isCheckingLevel) return;

    setIsCheckingLevel(true);
    setApiError(null); // Clear previous errors

    try {
      // 3. Fetch user info to check level
      const googleId = user?.id;
      if (!googleId) {
        throw new Error("User ID not available."); // Should not happen if isSignedIn is true
      }

      const userInfoResponse = await fetch(`https://cartoon.framepola.com/api/user/info?google_id=${googleId}`);
      if (!userInfoResponse.ok) {
        throw new Error(`API Error: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
      }

      const userInfoResult = await userInfoResponse.json();

      if (userInfoResult.code === 1000 && userInfoResult.data) {
        const freeCount = userInfoResult.data.api_left_times ?? 0; // Assuming free_count is in data, default to 0 if null/undefined
        const userLevel = userInfoResult.data.level ?? 0;   // Assuming level is in data, default to 0 if null/undefined

        // 4. 优先检查免费次数
        if (freeCount > 0) {
          console.log(`User has ${freeCount} free credits, proceeding with generation.`);
          await startImageGeneration();
        } else {
          // 5. 没有免费次数，检查等级
          console.log('User has no free credits, checking level.');
          if (userLevel === 0) {
            // 等级为 0，滚动到价格
            console.log('User level is 0, scrolling to pricing.');
            scrollToSection('pricing'); // Make sure you have id="pricing" on your pricing section
            setIsCheckingLevel(false); // 重置检查状态
            return; // 停止执行
          } else {
            // 等级 > 0，开始生成
            console.log('User level is sufficient, proceeding with generation.');
            await startImageGeneration();
          }
        }
      } else {
        // 处理 API 错误 (例如 code != 1000 或 data 不存在)
        throw new Error(userInfoResult.msg || 'Failed to fetch user subscription details.');
      }
    } catch (error) {
      console.error('Failed to check user level or start generation:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred.');
      setIsCheckingLevel(false); // Reset checking state on error
    }
    // Note: setIsCheckingLevel(false) is handled within the try/catch/scroll path.
    // For the generation path, isGenerating will take over the loading state.
  };

  // --- Extracted Generation Logic --- Find selected style prompt
  const startImageGeneration = async () => {
    setIsCheckingLevel(false);
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setCurrentTaskId(null);
    setGenerationProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile!); 
    const googleId = user?.id || '';
    formData.append('google_id', googleId);
    formData.append('prompt', promptInput);
    formData.append('size', selectedRatio);
    formData.append('is_enhance', String(isEnhanced));

    // Start simulation interval
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const totalSimulationTime = 110 * 1000;
    const intervals = 95;
    const intervalDuration = totalSimulationTime / intervals;

    progressIntervalRef.current = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          return 95;
        }
        return prev + 1;
      });
    }, intervalDuration);

    try {
      const response = await fetch('https://cartoon.framepola.com/api/generateImage/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          // Try to get a more specific error message from the API response body
           if (errorData && errorData.msg) {
               // Translate specific error codes if needed
               if (errorData.code === 1003) {
                   errorMsg = t('error.insufficientCredits', { defaultMessage: 'Insufficient credits available.' });
               } else {
                   errorMsg = errorData.msg;
               }
           }
        } catch (e) { /* Ignore JSON parsing error if body is not JSON */ };
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (result.code === 1000 && typeof result.data === 'string' && result.data.length > 0) {
        const taskId = result.data;
        console.log('Generation task started. Task ID:', taskId);
        setCurrentTaskId(taskId); // Trigger polling
      } else {
         // Handle generate API error (e.g., code 1003 or other non-1000 codes)
         let errorMessage = result.msg || t('error.genericGeneration', { defaultMessage: 'Failed to create generation task.' });
         if (result.code === 1003) {
             errorMessage = t('error.insufficientCredits', { defaultMessage: 'Insufficient credits available.' });
         }
         // Throw the specific error message
         throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Generation failed during creation:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred during task creation.');
      stopGenerationProcess(); // Stop progress simulation etc. on creation error
       // No need to set isGenerating false here, stopGenerationProcess does it
    }
     // isGenerating remains true until polling completes or fails
  };

  // --- Polling Logic --- 
  useEffect(() => {
    if (currentTaskId && isGenerating) {
      const pollTaskStatus = async () => {
        console.log(`Checking status for task: ${currentTaskId}`);
        try {
          const checkResponse = await fetch(`https://cartoon.framepola.com/api/generateImage/check?task_id=${currentTaskId}`);

          if (!checkResponse.ok) {
            // Handle check API network errors
            throw new Error(`Check API Error: ${checkResponse.status} ${checkResponse.statusText}`);
          }

          const checkResult = await checkResponse.json();

          if (checkResult.code === 1000 && checkResult.data) {
            const statusData = checkResult.data as CheckStatusData;

            if (statusData.status === 1 && statusData.opsuinfo?.dist_image) {
              // SUCCESS: Task completed
              console.log('Polling: Task completed!', statusData.opsuinfo.dist_image);
              // --- Set final progress to 100% --- 
              setGenerationProgress(100);
              setGeneratedImageUrl(statusData.opsuinfo.dist_image);
              setApiError(null);
              stopGenerationProcess(); // Stop polling, timers, and generating state
            } else if (statusData.status === 0) {
              // PENDING: Task still processing, poll again
              console.log('Polling: Task pending...');
              // Clear previous timeout before setting a new one
              if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = setTimeout(pollTaskStatus, 20000); // Poll again after 20 seconds
            } else {
              // FAILED: Task failed according to API status
              console.error('Polling: Task failed with status:', statusData.status);
              setApiError(statusData.status_msg || 'Image generation failed.');
              setGeneratedImageUrl(null);
              stopGenerationProcess(); // Stop polling, timers, and generating state
            }
          } else {
            // FAILED: Check API error
            console.error('Check API returned an unexpected response.');
            setApiError(checkResult.msg || 'Check API returned an unexpected response.');
            setGeneratedImageUrl(null);
            stopGenerationProcess(); // Stop polling, timers, and generating state
          }
        } catch (error) {
          console.error('Polling failed:', error);
          setApiError(error instanceof Error ? error.message : 'An unknown error occurred during polling.');
          setGeneratedImageUrl(null);
          stopGenerationProcess(); // Stop polling, timers, and generating state
        }
      };
      pollTaskStatus();

      // Cleanup function for the useEffect
      return () => {
        console.log('Cleaning up polling for task:', currentTaskId);
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
        // Optionally reset state if needed when task ID changes while polling (unlikely here)
        // stopGenerationProcess(); // Careful with this, might stop prematurely
      };
    }
    // Dependency array: Run when taskId changes, or when isGenerating becomes true
  }, [currentTaskId, isGenerating]);


  const handleRedoClick = () => {
    // Reset everything for redo
    setGeneratedImageUrl(null);
    setApiError(null);
    stopGenerationProcess();
  };

  // --- 修改 handleSaveClick --- 
  const handleSaveClick = () => {
    // 检查图片URL是否存在，以及是否已在下载中
    if (!generatedImageUrl || isDownloadingGeneratedImage) return;

    // 生成文件名
    const fileName = generatedImageUrl.split('/').pop() || 'polatoons-generated-image.png';

    // 调用下载函数
    downloadImageWithCors(
      generatedImageUrl,
      fileName,
      setIsDownloadingGeneratedImage, // Pass the specific state setter
      tUpload // Pass the translation function for upload/download messages
    );
  };

  useEffect(() => {
    // Cleanup interval/timeout on component unmount
    return () => {
      stopGenerationProcess();
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // --- Find selected style label for display --- 
  const getSelectedStyleLabel = () => {
    const style = styles.find(s => s.value === selectedStyleValue);
    return style ? tUpload(style.labelKey, { defaultMessage: style.value }) : 'Select Style...';
  };

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold font-fredoka mb-6 text-foreground">
          {t('title')}
        </h1>

        <p className="text-xl font-nunito text-muted-foreground mb-12">
          {t('subtitle')}
        </p>

        <div
          className={cn(
            "border rounded-2xl p-4 sm:p-6 mb-8 transition-all duration-200 ease-in-out relative",
            {
              "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background": isDragging,
              "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 shadow-sm": selectedFile && !isDragging,
              "border-dashed border-border bg-muted/20 hover:border-muted-foreground/50": !selectedFile && !isDragging,
              "opacity-60 cursor-not-allowed": isGenerating || isCheckingLevel,
            }
          )}
          onDragOver={!(isGenerating || isCheckingLevel) ? handleDragOver : undefined}
          onDragLeave={!(isGenerating || isCheckingLevel) ? handleDragLeave : undefined}
          onDrop={!(isGenerating || isCheckingLevel) ? handleDrop : undefined}
        >
          {selectedFile ? (
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
              <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col items-center justify-center bg-muted/50 p-4 rounded-lg">
                <div className="relative w-48 h-48 sm:w-full sm:aspect-square mb-3">
                  <Image
                    src={URL.createObjectURL(selectedFile)}
                    alt={tUpload('uploadedImageAlt')}
                    fill
                    className="object-contain rounded-lg"
                  />
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full z-10 bg-gray-900/70 text-white hover:bg-gray-900/90 dark:bg-gray-100/70 dark:text-gray-900 dark:hover:bg-gray-100/90 shadow-md border border-white/20 dark:border-black/20"
                    onClick={handleDeleteFile}
                    disabled={isGenerating || isCheckingLevel}
                    aria-label={tUpload('deleteImageLabel')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground w-full text-center truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
              </div>
              <div className="w-full md:w-2/3 flex flex-col">
                {!isGenerating && !generatedImageUrl && !isCheckingLevel ? (
                  <>
                    <div className="flex flex-col flex-grow">
                      <Label htmlFor="prompt-input" className="text-sm font-medium mb-1.5 text-left">{tUpload('promptLabel')}</Label>
                      <Textarea
                        id="prompt-input"
                        value={promptInput}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPromptInput(e.target.value)}
                        placeholder={tUpload('promptPlaceholder')}
                        className="resize-none bg-background text-sm p-2.5 w-full h-full min-h-[120px]"
                        rows={1}
                        disabled={isGenerating || isCheckingLevel}
                      />
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-border pt-4 mt-auto flex-shrink-0">
                      <div className="flex flex-col items-start gap-1.5">
                        <Label className="text-xs text-muted-foreground">{tUpload('styleLabel')}</Label>
                        <DropdownMenu open={styleComboboxOpen} onOpenChange={setStyleComboboxOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[150px] justify-start gap-2 h-10 text-sm font-normal bg-background hover:bg-muted truncate pl-2.5 pr-1.5" disabled={isGenerating || isCheckingLevel}>
                              {(() => {
                                const selectedStyle = styles.find(s => s.value === selectedStyleValue);
                                if (!selectedStyle) return <span className="truncate">{getSelectedStyleLabel()}</span>;
                                return (
                                  <>
                                    <Image
                                      src={selectedStyle.imageSrc}
                                      alt={tUpload(selectedStyle.labelKey, { defaultMessage: selectedStyle.value })}
                                      width={24}
                                      height={24}
                                      className="rounded-sm flex-shrink-0"
                                    />
                                    <span className="truncate flex-grow text-left">{tUpload(selectedStyle.labelKey, { defaultMessage: selectedStyle.value })}</span>
                                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                  </> 
                                );
                              })()}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[340px] lg:w-[760px] p-2 lg:p-4">
                            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-4">
                              {styles.map((style) => (
                                <button
                                  key={style.value}
                                  className="flex flex-col items-center justify-start p-1 lg:p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring transition-colors cursor-pointer gap-1.5 lg:gap-2 text-center"
                                  onClick={() => {
                                    setSelectedStyleValue(style.value);
                                    const selectedStyleData = styles.find(s => s.value === style.value);
                                    if (selectedStyleData) {
                                        setPromptInput(selectedStyleData.prompt);
                                    }
                                    setStyleComboboxOpen(false);
                                  }}
                                >
                                  <Image
                                    src={style.imageSrc}
                                    alt={tUpload(style.labelKey, { defaultMessage: style.value })}
                                    width={80}
                                    height={80}
                                    className="lg:w-[100px] lg:h-[150px] rounded-md object-cover border border-border/10 flex-shrink-0"
                                  />
                                  <span className="text-xs lg:text-sm font-medium text-foreground/90 leading-tight px-1 line-clamp-2">
                                    {tUpload(style.labelKey, { defaultMessage: style.value })}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-col items-start gap-1.5">
                        <Label className="text-xs text-muted-foreground">{tUpload('ratioLabel')}</Label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                          <PopoverTrigger asChild>
                             <Button variant="outline" className="w-[100px] justify-start gap-2 h-10 text-sm font-normal bg-background hover:bg-muted pl-2.5 pr-1.5" disabled={isGenerating || isCheckingLevel}>
                               {getRatioIcon(selectedRatio)}
                               <span className="truncate flex-grow text-left">
                                 {selectedRatio || tUpload('selectRatioPlaceholder')}
                               </span>
                               <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[120px] p-1">
                            <Command>
                              <CommandList>
                                  <CommandEmpty>{tUpload('noRatioFound')}</CommandEmpty>
                                  <CommandGroup>
                                    {aspectRatios.map((ratio) => (
                                      <CommandItem
                                        key={ratio.value}
                                        value={ratio.value}
                                        onSelect={(currentValue) => {
                                          setSelectedRatio(currentValue);
                                          setComboboxOpen(false);
                                        }}
                                        className="text-sm cursor-pointer flex items-center gap-2 p-2 rounded-sm"
                                      >
                                        <Check
                                          className={cn(
                                            "h-4 w-4",
                                            selectedRatio === ratio.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {getRatioIcon(ratio.value)}
                                        <span>{ratio.label}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                        
                        <div className="flex items-center space-x-2 pt-[1.125rem]">
                          <Checkbox
                            id="ai-enhance"
                            checked={isEnhanced}
                            onCheckedChange={(checked) => setIsEnhanced(Boolean(checked))}
                            className="h-5 w-5"
                            disabled={isGenerating || isCheckingLevel}
                          />
                          <Label htmlFor="ai-enhance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {tUpload('aiEnhanceLabel')}
                          </Label>
                        </div>
                    </div>
                  </>
                ) : (
                   null 
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium mb-2 text-foreground">{tUpload('dragDrop')}</p>
              <p className="text-sm text-muted-foreground mb-4">{tUpload('or')}</p>
              <label className={`inline-block ${isGenerating || isCheckingLevel ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className="sr-only">{tUpload('chooseFile')}</span>
                <input
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isGenerating || isCheckingLevel}
                />
                <Button variant="outline" asChild disabled={isGenerating || isCheckingLevel}>
                  <span>
                    {tUpload('browseFiles')}
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {apiError && !isGenerating && !generatedImageUrl && (
           <Alert variant="destructive" className="mb-8 max-w-md mx-auto text-left animate-fade-in">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>{tUpload('error.genericTitle', { defaultMessage: 'Action Failed' })}</AlertTitle>
             <AlertDescription>
               {apiError}
             </AlertDescription>
           </Alert>
        )}

        <div className="flex flex-wrap justify-center items-center gap-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-500 text-white hover:from-primary/90 hover:to-blue-500/90 text-lg px-8 py-3 h-auto font-medium rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 min-w-[160px]"
            onClick={handleGenerateClick}
            disabled={!selectedFile || isGenerating || isCheckingLevel || isDownloadingGeneratedImage}
          >
            {(isCheckingLevel || isGenerating) && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            {!(isCheckingLevel || isGenerating) && (
              <span className="mr-2">✨</span>
            )}

            {isCheckingLevel && tUpload('checking', { defaultMessage: 'Checking...' })}
            {!isCheckingLevel && isGenerating && tUpload('generatingMessage')}
            {!isCheckingLevel && !isGenerating && t('tryNow')}
          </Button>

          <Button
            variant="outline"
            className="text-foreground border-border hover:bg-accent text-lg px-8 py-3 h-auto font-medium rounded-xl"
            onClick={() => scrollToSection('examples')}
            disabled={isGenerating || isCheckingLevel}
          >
            📸 {t('viewSamples')}
          </Button>
        </div>

        {(isGenerating || generatedImageUrl) && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-md mx-auto animate-fade-in">
            {apiError && isGenerating && currentTaskId && (
              <Alert variant="destructive" className="mb-4 text-left">
                 <AlertTriangle className="h-4 w-4" />
                 <AlertTitle>{tUpload('pollingErrorTitle', { defaultMessage: 'Polling Failed' })}</AlertTitle>
                 <AlertDescription>
                   {apiError}
                 </AlertDescription>
               </Alert>
            )}

            {generatedImageUrl && !isGenerating && (
              <div className="text-center">
                <div className="relative w-full aspect-square mb-6 rounded-lg overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
                  <Image
                    src={generatedImageUrl}
                    alt={tUpload('generatedResultAlt')}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleRedoClick}
                    className="rounded-lg"
                    disabled={isDownloadingGeneratedImage}
                  >
                    {tUpload('redo')}
                  </Button>
                  <Button
                    onClick={handleSaveClick}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg min-w-[100px]"
                    disabled={isDownloadingGeneratedImage}
                  >
                    {isDownloadingGeneratedImage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isDownloadingGeneratedImage
                      ? tUpload('downloading', { defaultMessage: 'Downloading...' })
                      : tUpload('saveImage')}
                  </Button>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-4">
                <p className="text-lg font-medium text-foreground mb-4">
                  {currentTaskId ? tUpload('pollingMessage', { defaultMessage: 'Checking result...' }) : tUpload('generatingMessage', { defaultMessage: 'Starting generation...'})}
                </p>
                <Progress value={generationProgress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground mt-2">{generationProgress}%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
} 