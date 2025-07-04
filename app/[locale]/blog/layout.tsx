import React from 'react';
import { Navbar } from '../../../components/Navbar';





export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <>
      {/* 自定义博客导航替换全局导航 */}
      <Navbar />
      <div className="min-h-screen flex flex-col bg-background">
        {children}
      </div>
    </>
  );
} 