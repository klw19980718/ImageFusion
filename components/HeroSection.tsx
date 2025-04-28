'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

export default function HeroSection() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 图片上传处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // 点击上传区域触发文件选择
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 拖放处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <section className="py-20 md:py-28 px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12 fade-in">
          <p className="text-primary mb-4 font-medium">AI Image Fusion</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Combine Images to Create Stunning Visuals Online
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            The best AI Image Fusion tool to seamlessly combine images into one and effortlessly generate creative art using advanced AI technology.
          </p>
        </div>

        {/* 上传区域 */}
        <div 
          className="max-w-2xl mx-auto bg-card p-8 rounded-standard shadow-custom border border-muted/20 fade-in"
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!imageFile ? (
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Drag and drop a photo file here to upload</p>
              <p className="text-sm text-muted-foreground mb-6">or</p>
              <Button className="px-6">Choose a file</Button>
              <p className="text-xs text-muted-foreground mt-6">
                Supported file formats: JPG, PNG, GIF, WebP, BMP<br />
                Maximum file size: 50 MB
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif, image/webp, image/bmp"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md h-48 mb-6">
                <Image 
                  src={URL.createObjectURL(imageFile)} 
                  alt="Selected image" 
                  fill 
                  className="object-contain rounded-md"
                />
              </div>
              <p className="text-lg text-foreground mb-4">
                {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                  }}
                >
                  Remove
                </Button>
                <Button>Proceed to Fusion</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 