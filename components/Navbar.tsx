'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import AuthButton from './auth/auth-button';
import { ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 获取当前语言
  const currentLocale = params.locale as string || 'zh';
  const currentLanguage = currentLocale === 'zh' ? t('chinese') : t('english');
  
  // 检查是否在首页
  const isHomePage = pathname === `/${currentLocale}`;

  // 切换语言
  const switchLocale = (locale: string) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
    setIsMobileMenuOpen(false);
  };

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

  // Render navigation links (WITHOUT SheetClose wrapper)
  const renderNavLinks = (isMobile = false) => {
    const navItems = [
      { id: 'features', label: t('features'), section: true },
      { id: 'showcase', label: t('examples'), section: true },
      { id: 'testimonials', label: t('reviews'), section: true },
      { id: 'pricing', label: t('pricing'), section: true },
      { id: 'faq', label: t('faq'), section: true },
      { id: 'blog', label: t('blog'), href: `/${currentLocale}/blog` },
    ];

    return (
      <>
        <Link
          href={`/${currentLocale}`}
          className={`block w-full text-left rounded-md ${
            pathname === `/${currentLocale}` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary transition-standard'
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
                href={`/${currentLocale}#${item.id}`}
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
        {/* Left: Logo (ensure it doesn't shrink) */}
        <div className="flex-shrink-0">
          <Link href={`/${currentLocale}`} className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="text-2xl font-bold text-primary">
              ImageFusion
            </span>
          </Link>
        </div>
        
        {/* Middle: Desktop Nav Links (Centered) */}
        <div className="hidden lg:flex justify-center flex-grow">
           <div className="flex items-center space-x-6 flex-nowrap">
             {renderNavLinks(false)}
           </div>
        </div>
        
        {/* Right Section (ensure it doesn't shrink) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Desktop: Language + Auth Button Group */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-foreground hover:text-primary transition-standard p-0 h-auto focus:outline-none focus:ring-0"
                >
                  {currentLanguage}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => switchLocale('zh')}
                  className="cursor-pointer hover:bg-muted focus:bg-muted transition-standard"
                >
                  {t('chinese')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => switchLocale('en')}
                  className="cursor-pointer hover:bg-muted focus:bg-muted transition-standard"
                >
                  {t('english')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Auth Button (Desktop) */}
            <AuthButton />
          </div>

          {/* Mobile: Auth Button + Menu Trigger Group */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Auth Button (Mobile) */}
            <AuthButton />
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary transition-standard hover:bg-muted">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] px-6 pt-12 pb-8 bg-background flex flex-col">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle className="text-lg font-semibold text-foreground">{t('menuTitle', { defaultMessage: 'Menu' })}</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 flex flex-col space-y-2 mb-8 overflow-y-auto">
                  <SheetClose asChild>
                    <Link
                      href={`/${currentLocale}`}
                      className={`block w-full text-left rounded-md ${
                        pathname === `/${currentLocale}` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary transition-standard'
                      } px-4 py-3 text-base`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('home')}
                    </Link>
                  </SheetClose>
                  
                  {isHomePage ? (
                    <>
                      <SheetClose asChild>
                        <button
                          onClick={() => handleMobileLinkClick(() => scrollToSection('features'))}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('features')}
                        </button>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={() => handleMobileLinkClick(() => scrollToSection('showcase'))}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('examples')}
                        </button>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={() => handleMobileLinkClick(() => scrollToSection('testimonials'))}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('reviews')}
                        </button>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={() => handleMobileLinkClick(() => scrollToSection('pricing'))}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('pricing')}
                        </button>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={() => handleMobileLinkClick(() => scrollToSection('faq'))}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('faq')}
                        </button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link
                          href={`/${currentLocale}#features`}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('features')}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href={`/${currentLocale}#showcase`}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('examples')}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href={`/${currentLocale}#testimonials`}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('reviews')}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href={`/${currentLocale}#pricing`}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('pricing')}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href={`/${currentLocale}#faq`}
                          className="block w-full text-left rounded-md text-foreground hover:text-primary transition-standard px-4 py-3 text-base"
                        >
                          {t('faq')}
                        </Link>
                      </SheetClose>
                    </>
                  )}
                  <SheetClose asChild>
                    <Link
                      href={`/${currentLocale}/blog`}
                      className={`block w-full text-left rounded-md ${
                        pathname.startsWith(`/${currentLocale}/blog`) ? 'text-primary font-semibold' : 'text-foreground hover:text-primary transition-standard'
                      } px-4 py-3 text-base`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('blog')}
                    </Link>
                  </SheetClose>
                </nav>
                <div className="mt-auto border-t border-muted/80 pt-6">
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button
                         variant="ghost"
                         className="flex w-full justify-between items-center gap-2 text-foreground hover:text-primary transition-standard focus:outline-none focus:ring-0 px-4 py-3 text-base rounded-md h-auto"
                       >
                         <span>{t('language')}: {currentLanguage}</span>
                         <ChevronDown className="h-4 w-4 opacity-60" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" sideOffset={8} className="w-[calc(300px-3rem)] sm:w-[calc(340px-3rem)] rounded-lg shadow-lg">
                       <DropdownMenuItem
                         onClick={() => switchLocale('zh')}
                         className="cursor-pointer px-4 py-2.5 text-base hover:bg-muted focus:bg-muted transition-standard rounded"
                       >
                         {t('chinese')}
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         onClick={() => switchLocale('en')}
                         className="cursor-pointer px-4 py-2.5 text-base hover:bg-muted focus:bg-muted transition-standard rounded"
                       >
                         {t('english')}
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 