import React from 'react';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { serverCmsApi } from '../../../lib/server-api';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const friendlyLinks = await serverCmsApi.getFriendLinkList();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer friendlyLinks={friendlyLinks} />
    </div>
  );
} 