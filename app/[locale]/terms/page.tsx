import { Footer } from '../../../components/Footer';
import { serverCmsApi } from '../../../lib/server-api';
import PageLayout from '../page-layout';
import TermsContentClient from './TermsContentClient';

export default async function TermsOfServicePage() {
  const friendlyLinks = await serverCmsApi.getFriendLinkList();

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <TermsContentClient />
        <Footer friendlyLinks={friendlyLinks} />
      </div>
    </PageLayout>
  );
} 