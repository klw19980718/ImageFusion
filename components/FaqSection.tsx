'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  // FAQ开关
  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const faqItems = [
    {
      question: 'What does AI Image Fusion do?',
      answer: 'AI Image Fusion combines multiple images into a single, enhanced image by merging their best features and details. It allows for an unlimited amount of creativity from only a source and a reference image.'
    },
    {
      question: 'What is the best AI Image Fusion?',
      answer: "ImageFusion's AI Image Fusion uses powerful AI algorithms, its super-streamlined interface makes it a breeze to use, and it is 100% online, so no need to download any heavy software."
    },
    {
      question: 'How to use AI Image Fusion?',
      answer: 'Simply upload an image and choose a style, or take a style from a reference image. Preview your generations and download to your device. You can do this all online, without having to download any heavy AI software.'
    },
    {
      question: 'Do I need technical skills to use AI Image Fusion?',
      answer: 'Zero skills are needed. AI Image Fusion will do all the hard work for you. What would have taken hours of painstaking manual layer editing, masking and blending, is now as simple as a few clicks.'
    },
    {
      question: 'Can I use AI Image Fusion for commercial use?',
      answer: 'AI Image Fusion can enhance product photos for e-commerce, create high-quality marketing materials, streamline photo retouching in fashion and beauty industries. In fact, there is an almost endless amount of commercial possibilities for AI Image Fusion.'
    },
    {
      question: 'Why do I want to use AI Image Fusion?',
      answer: 'You would want to use AI Image Fusion to enhance image quality by combining the best features from multiple photos, save time on manual photo editing, and produce visually appealing and detailed images for marketing, e-commerce, and more. You are essentially removing the painstaking act of high-level layer-editing, blending and masking, which can take years of dedicated time investment to produce quality results.'
    },
    {
      question: 'What types of images can I use with AI Image Fusion?',
      answer: 'Upload high-quality, blur-free images for best results. ImageFusion supports popular image formats.'
    }
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
          AI Image Fusion FAQ
        </h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqItems.map((faq, index) => (
            <div 
              key={index} 
              className="bg-card border border-muted/20 rounded-standard overflow-hidden transition-standard"
            >
              <button 
                className="w-full p-6 flex justify-between items-center text-left cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                <ChevronDown 
                  className={`h-5 w-5 text-primary transition-transform duration-300 ${faqOpen[index] ? 'rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${faqOpen[index] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 