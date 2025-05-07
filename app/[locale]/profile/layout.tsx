import React from 'react';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
} 