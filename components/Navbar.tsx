'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import AuthButton from './auth/auth-button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "../components/ui/sheet";

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 检查是否在首页 (现在是根路径)
  const isHomePage = pathname === '/';

  // 平滑滚动到指定ID
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Helper function for mobile links to handle closing menu
  const handleMobileLinkClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  // Render navigation links
  const renderNavLinks = (isMobile = false) => {
    const navItems = [
      { id: 'features', label: t('features'), section: true },
      // 使用 "useCases" 作为 key, 对应翻译文件中的 "Use Cases"
      { id: 'showcase', label: t('useCases'), section: true }, 
      // { id: 'testimonials', label: t('reviews'), section: true },
      { id: 'pricing', label: t('pricing'), section: true },
      { id: 'faq', label: t('faq'), section: true },
      // 移除了 /en 前缀
      { id: 'blog', label: t('blog'), href: '/blog' }, 
    ];

    return (
      <>
        <Link
          // 移除了 /en 前缀
          href="/"
          className={`block w-full text-left rounded-md ${
            // 移除了 /en 前缀
            pathname === '/' ? 'text-primary font-semibold' : 'text-foreground hover:text-primary transition-standard'
          } ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-2 whitespace-nowrap'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {t('home')}
        </Link>

        {navItems.map((item) => (
          item.section ? (
            isHomePage ? (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left rounded-md text-foreground hover:text-primary transition-standard ${
                  isMobile ? 'px-4 py-3 text-base' : 'px-4 py-2 whitespace-nowrap'
                }`}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                // 移除了 /en 前缀
                href={`/#${item.id}`} 
                className={`block w-full text-left rounded-md text-foreground hover:text-primary transition-standard ${
                  isMobile ? 'px-4 py-3 text-base' : 'px-4 py-2 whitespace-nowrap'
                }`}
              >
                {item.label}
              </Link>
            )
          ) : item.href ? (
            <Link
              key={item.id}
              href={item.href}
              className={`block w-full text-left rounded-md ${
                pathname.startsWith(item.href) ? 'text-primary font-semibold' : 'text-foreground hover:text-primary transition-standard'
              } ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-2 whitespace-nowrap'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ) : null
        ))}
      </>
    );
  };

  return (
    <nav className="py-4 px-6 bg-background border-b border-muted shadow-custom sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Logo */} 
        <div className="flex-shrink-0">
          {/* 移除了 /en 前缀 */}
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
            {/* 应用了 Baloo 2 字体 (通过 style) */}
            <span 
              className="text-2xl font-bold text-primary" 
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              ImageFusion
            </span>
          </Link>
        </div>
        
        {/* Middle: Desktop Nav Links */}
        <div className="hidden lg:flex justify-center flex-grow">
           <div className="flex items-center space-x-6 flex-nowrap">
             {renderNavLinks(false)}
           </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Desktop: Auth Button */} 
          <div className="hidden lg:flex items-center">
            {/* AuthButton 本身需要修改才能应用按钮样式 */}
            <AuthButton />
          </div>

          {/* Mobile: Auth Button + Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            {/* AuthButton 本身需要修改才能应用按钮样式 */}
            <AuthButton />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary transition-standard hover:bg-muted">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] px-6 pt-12 pb-8 bg-background flex flex-col">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle className="text-lg font-semibold text-foreground">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 flex flex-col space-y-2 mb-8 overflow-y-auto">
                  {renderNavLinks(true)}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 