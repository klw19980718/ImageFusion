'use client';

import { useTranslations } from 'next-intl';
import { 
  SignInButton, 
  UserButton, 
  useUser, 
  useClerk
} from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import { useParams } from 'next/navigation';
import UserProfileMenu from './user-profile-menu';

export default function AuthButton() {
  const t = useTranslations('nav');
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const params = useParams();
  const locale = params.locale as string || 'zh';

  if (isSignedIn && user) {
    return (
      <UserProfileMenu user={user} />
    );
  }

  return (
    <Button
      className="bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={() => openSignIn()}
    >
      {t('login')}
    </Button>
  );
} 