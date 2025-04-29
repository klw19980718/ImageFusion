"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Upload, ImageIcon, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

export default function HeroSection() {
  const t = useTranslations("home");
  const params = useParams();
  const currentLocale = (params.locale as string) || "zh";
  const isZh = currentLocale === "zh";

  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState<number>(0); // 选中的风格索引
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null); // 添加风格图片上传的ref
  const [isPromptMode, setIsPromptMode] = useState(false); // 是否使用提示词模式
  const [promptText, setPromptText] = useState(""); // 提示词文本
  const [stylePopoverOpen, setStylePopoverOpen] = useState(false);
  const [promptPopoverOpen, setPromptPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [customStyleImage, setCustomStyleImage] = useState<File | null>(null); // 添加自定义风格图片状态

  // 默认示例图片
  const defaultExample = '/examples/photos/1.jpg';

  // 预设风格图片
  const styleImages = [
    { src: '/styles/1.jpg', name: isZh ? '水彩风格' : 'Watercolor' },
    { src: '/styles/2.jpg', name: isZh ? '油画风格' : 'Oil Painting' },
    { src: '/styles/3.jpg', name: isZh ? '素描风格' : 'Sketch' },
    { src: '/styles/1.jpg', name: isZh ? '波普艺术' : 'Pop Art' },
    { src: '/styles/2.jpg', name: isZh ? '赛博朋克' : 'Cyberpunk' },
    { src: '/styles/3.jpg', name: isZh ? '二次元' : 'Anime' }
  ];

  // 组件加载时自动加载默认示例图片
  useEffect(() => {
    loadDefaultExample();
  }, []);

  // 加载默认示例图片
  const loadDefaultExample = () => {
    fetch(defaultExample)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `example-source.jpg`, {
          type: "image/jpeg",
        });
        setSourceImage(file);
      });
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSourceImage(files[0]);
      setResultImage(null); // 重置结果
    }
  };

  // 点击上传按钮
  const handleUploadClick = () => {
    sourceInputRef.current?.click();
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 处理文件放置
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSourceImage(files[0]);
      setResultImage(null); // 重置结果
    }
  };

  // 选择风格
  const selectStyle = (index: number) => {
    setSelectedStyleIndex(index);
    setIsPromptMode(false);
    setResultImage(null); // 重置结果
    setStylePopoverOpen(false); // 关闭弹窗
  };

  // 切换到提示词模式
  const enablePromptMode = () => {
    setIsPromptMode(true);
    setResultImage(null); // 重置结果
    
    // 在下一个渲染周期后聚焦输入框
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  // 切换到图片风格模式
  const disablePromptMode = () => {
    setIsPromptMode(false);
  };

  // 提示词输入处理
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  };

  // 处理风格图片上传
  const handleStyleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCustomStyleImage(files[0]);
      setIsPromptMode(false); // 切换到图片风格模式
      setResultImage(null); // 重置结果
    }
  };
  
  // 点击上传风格图片按钮
  const handleStyleUploadClick = () => {
    styleInputRef.current?.click();
  };

  // 生成融合图片
  const generateImage = () => {
    if (!sourceImage) return;

    setIsGenerating(true);

    // 模拟生成过程（实际项目中应调用API）
    setTimeout(() => {
      // 假设这是生成的图像URL
      setResultImage("/examples/result.jpg");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <>
      <section className="pt-24 pb-20 md:pt-32 md:pb-24 bg-gradient-to-b from-black to-zinc-900 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] bg-center opacity-20"></div>

        <div className="container mx-auto px-1 sm:px-2 relative z-10 max-w-[1500px]">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-6">
              {t("description")}
            </p>
          </div>

          <div className="w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-1">
              {/* Source区域 */}
              <div className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("sourceLabel")}
                </h2>
                <div className="bg-zinc-800 p-4 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* 当前源图预览 */}
                  <div className="aspect-square relative overflow-hidden rounded-lg border border-zinc-600">
                    {!sourceImage ? (
                      <div 
                        className="flex flex-col items-center justify-center h-full cursor-pointer"
                        onClick={handleUploadClick}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <Upload className="h-10 w-10 text-yellow-500 mb-4" />
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
                  className="w-full border-zinc-600 text-white hover:bg-zinc-700"
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
              
              {/* Style区域 - 简化版 */}
              <div className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t("styleLabel")}
                </h2>
                
                <div className="bg-zinc-800 p-4 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  {/* 当前选中的风格预览或提示词展示 */}
                  <div className="aspect-square relative overflow-hidden rounded-lg border border-zinc-600">
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
                          src={styleImages[selectedStyleIndex].src}
                          alt={styleImages[selectedStyleIndex].name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-2 px-3">
                          <p className="text-white text-sm font-medium">
                            {styleImages[selectedStyleIndex].name}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* 风格选择按钮（弹窗） */}
                  <Popover open={stylePopoverOpen} onOpenChange={setStylePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`w-full border-zinc-600 ${!isPromptMode && !customStyleImage ? "bg-zinc-700 text-yellow-500" : "text-white hover:bg-zinc-700"} flex items-center justify-center gap-2`}
                        onClick={disablePromptMode}
                      >
                        <ImageIcon className="h-4 w-4" />
                        {t("chooseStyle")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-4 bg-zinc-800 border border-zinc-600" style={{ width: "420px", maxWidth: "90vw" }}>
                      <h3 className="text-white text-sm font-medium mb-3">
                        {t("selectStyle")}
                      </h3>
                      <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
                        {styleImages.map((style, index) => (
                          <div
                            key={index}
                            className={`aspect-square relative overflow-hidden rounded-md cursor-pointer
                              ${selectedStyleIndex === index && !isPromptMode && !customStyleImage
                                ? 'ring-2 ring-yellow-500' 
                                : 'opacity-80 hover:opacity-100'}`}
                            onClick={() => selectStyle(index)}
                          >
                            <Image
                              src={style.src}
                              alt={style.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* 上传风格图片按钮 (替换原来的提示词按钮) */}
                  <Button 
                    variant="outline" 
                    className={`w-full border-zinc-600 ${customStyleImage ? "bg-zinc-700 text-yellow-500" : "text-white hover:bg-zinc-700"} flex items-center justify-center gap-2`}
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
                <div className="bg-zinc-800 p-4 rounded-lg shadow-lg border border-zinc-700 mb-4 flex flex-col">
                  <div className="aspect-square relative overflow-hidden rounded-lg border border-zinc-600 flex flex-col items-center justify-center">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                        <p className="text-lg text-white text-center">{t("generatingText")}</p>
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
                
                <Button 
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                  onClick={generateImage}
                  disabled={!sourceImage || isGenerating}
                >
                  {isGenerating ? t("generatingText") : t("generateButton")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
