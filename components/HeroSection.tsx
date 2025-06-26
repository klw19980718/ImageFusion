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
import { api } from "@/app/config/api";
import { useToast } from "@/components/ui/toast-provider";

// --- localStorage Key ---
const CACHED_SOURCE_IMAGE_KEY = "cachedSourceImage";

// --- Helper function to convert Base64 back to File ---
async function base64ToFile(dataUrl: string, filename: string, type: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type });
}

// Image download function
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
    link.download = filename || `imagefusion-result.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    console.log("Image download initiated!");
  } catch (error: any) {
    console.error("Download failed:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  } finally {
    setIsDownloading(false);
  }
}

// Define new task status check interface
interface TaskStatusData {
  task_id: string;
  status: number; // 0 generating, 1 success, -1 failed
  status_msg: string;
  image_url?: string;
  progress: string;
}

export default function HeroSection() {
  const t = useTranslations("home");
  const params = useParams();
  const currentLocale = (params.locale as string) || "zh";
  const isZh = currentLocale === "zh";
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const toast = useToast();

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

  // Add generation and download related states
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCheckingLevel, setIsCheckingLevel] = useState(false);

  // Refs for intervals and timeouts
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to stop all generation processes
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

  // Load default example image (Now only called as fallback)
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

  // Handle file selection (Add Caching)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSourceImage(file);
      setIsUserUploadedSource(true);
      setResultImage(null);
      cacheSourceFile(file); // Cache the uploaded file
      toast.success("Source image uploaded successfully!");
    }
  };

  const handleUploadClick = () => {
    sourceInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle file drag and drop (Add Caching)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSourceImage(file);
      setIsUserUploadedSource(true);
      setResultImage(null);
      cacheSourceFile(file); // Cache the dropped file
      toast.success("Source image uploaded successfully!");
    }
  };

  const selectStyle = (index: number) => {
    setSelectedStyleIndex(index);
    setIsPromptMode(false);
    setCustomStyleImage(null);
    setResultImage(null);
    setStylePopoverOpen(false);
    // toast.info(`Style selected: ${imgFusionTemplates[index].name}`);
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
      toast.success("Custom style image uploaded successfully!");
    }
  };

  const handleStyleUploadClick = () => {
    styleInputRef.current?.click();
  };

  // Download result image
  const handleDownloadClick = async () => {
    if (!resultImage || isDownloading) return;

    const fileName = resultImage.split("/").pop() || "imagefusion-result.png";
    
    try {
      await downloadImageWithCors(resultImage, fileName, setIsDownloading, t);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  // New: Actual API call for image generation process
  const startImageGeneration = async () => {
    setIsCheckingLevel(false);
    setIsGenerating(true);
    setResultImage(null);
    setCurrentTaskId(null);
    setGenerationProgress(0);
    toast.info("Starting image generation...");

    // Start progress simulation
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
      // Step 1: Upload user's source image, get URL
      console.log("Step 1: Uploading source image...");
      const uploadResult = await api.image.uploadImage(sourceImage!);
      
      if (uploadResult.code !== 200 || !uploadResult.data) {
        const errorMsg = uploadResult.msg || "Failed to upload source image";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      const otherImageUrl = uploadResult.data;
      console.log("Source image uploaded successfully, URL:", otherImageUrl);

              // Step 2: Prepare style image file
      let styleFile: File;
      if (customStyleImage) {
        styleFile = customStyleImage;
      } else {
        // If no custom style image, get one from preset styles
        try {
          const styleSrc = imgFusionTemplates[selectedStyleIndex].imageSrc;
          const styleResponse = await fetch(styleSrc);
          const styleBlob = await styleResponse.blob();
          styleFile = new File([styleBlob], "style-image.jpg", {
            type: "image/jpeg",
          });
        } catch (error) {
          console.error("Failed to get style image:", error);
          toast.error("Unable to get style image, please upload a custom style image or try again");
          stopGenerationProcess();
          setIsCheckingLevel(false);
          return;
        }
      }

      // Step 3: Build appropriate prompt
      const customStylePrompt = 'Fuse the key style features of image 2 onto image 1';

      // Step 4: Create AI generation task
      console.log("Step 2: Creating AI generation task...");
      const createTaskResult = await api.image.createTask({
        file: styleFile,
        prompt: customStylePrompt,
        size: "2:3",
        other_image: otherImageUrl,
      });

      if (!createTaskResult.data?.task_id) {
        const errorMsg = "Failed to create generation task - no task ID returned";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const taskId = createTaskResult.data.task_id;
      console.log("Generation task started. Task ID:", taskId);
      setCurrentTaskId(taskId); // Start polling

    } catch (error) {
      console.error("Generation process failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred during task creation.";
      toast.error(errorMsg);
      stopGenerationProcess();
    }
  };

  // Generate fusion image - Modified to call API
  const generateImage = async () => {
    if (!sourceImage || isGenerating) return;

    // Check login status
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    setIsCheckingLevel(true);

    try {
      // Actual API call
      await startImageGeneration();
    } catch (error) {
      console.error("Failed to check user level or start generation:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred.";
      toast.error(errorMsg);
      setIsCheckingLevel(false);
    }
  };

  // Add polling logic
  useEffect(() => {
    if (currentTaskId && isGenerating) {
      const pollTaskStatus = async () => {
        console.log(`Checking task status: ${currentTaskId}`);
        try {
          const checkResult = await api.image.checkTaskStatus(currentTaskId);

          if (checkResult.code === 200 && checkResult.data) {
            const statusData = checkResult.data;

            if (statusData.status === 1 && statusData.image_url) {
              // Success: Task completed
              console.log("Polling: Task completed!", statusData.image_url);
              console.log("Setting result image to:", statusData.image_url);
              setGenerationProgress(100);
              setResultImage(statusData.image_url);
              toast.success("Image generation completed successfully!");
              // Stop generation but keep progress at 100%
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
              console.log("Generation completed, isGenerating set to false, resultImage set");
            } else if (statusData.status === 0) {
              // Pending: Task still processing, continue polling
              console.log("Polling: Task in progress...");
              if (pollingTimeoutRef.current)
                clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = setTimeout(pollTaskStatus, 2000); // Poll again after 2 seconds
            } else {
              // Failed: Task failed according to API status
              console.error("Polling: Task failed, status:", statusData.status);
              const errorMsg = statusData.status_msg || "Image generation failed.";
              toast.error(errorMsg);
              setResultImage(null);
              stopGenerationProcess();
            }
          } else {
            // Failed: Check API error
            console.error("Check API returned unexpected response.");
            const errorMsg = checkResult.msg || "Check API returned unexpected response.";
            toast.error(errorMsg);
            setResultImage(null);
            stopGenerationProcess();
          }
        } catch (error) {
          console.error("Polling failed:", error);
          const errorMsg = error instanceof Error ? error.message : "Unknown error occurred during polling.";
          toast.error(errorMsg);
          setResultImage(null);
          stopGenerationProcess();
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
              {/* Source area */}
              <div className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("sourceLabel")}
                </h2>
                <div className="bg-zinc-800 p-4 md:p-5 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* Unified minimum height increase */}
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

              {/* Plus sign connection */}
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

              {/* Style area */}
              <div className="md:col-span-4">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("styleLabel")}
                </h2>
                <div className="bg-zinc-800 p-4 md:p-5 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* Unified minimum height increase */}
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
                  {/* Style selection button (popup) */}
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
                              ${selectedStyleIndex === index &&
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

                  {/* Upload style image button */}
                  <Button
                    variant="outline"
                    className={`w-full border-zinc-600 ${customStyleImage ? "bg-zinc-700 text-yellow-500" : "text-white hover:bg-zinc-700"
                      } flex items-center justify-center gap-2 rounded-md`}
                    onClick={handleStyleUploadClick}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Style
                  </Button>

                  {/* Hidden style image upload input */}
                  <input
                    type="file"
                    ref={styleInputRef}
                    onChange={handleStyleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp, image/bmp"
                  />
                </div>
              </div>

              {/* Plus sign and arrow */}
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

              {/* Result area */}
              <div className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("resultLabel")}
                </h2>
                <div className="bg-zinc-800 p-4 md:p-5 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* Unified minimum height increase */}
                  <div className="aspect-[3/4] min-h-[400px] relative overflow-hidden rounded-lg border border-zinc-600 flex flex-col items-center justify-center">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full w-full p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                        <p className="text-lg text-white text-center mb-4">
                          {t("generatingText")}
                        </p>
                        {/* Add progress bar */}
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

                {/* Adjust button layout based on state */}
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
                          Checking...
                        </>
                      ) : isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("generatingText")}
                        </>
                      ) : (
                        t("generateAgain")
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
                          Downloading...
                        </>
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
                          Checking...
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


          </div>
        </div>
      </section>
    </>
  );
}
