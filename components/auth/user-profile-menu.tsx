'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";

interface UserProfileMenuProps {
  user: UserResource;
}

// 使用模块级变量记录同步状态 (谨慎使用)
const syncStatusByUser: { [userId: string]: boolean } = {};

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const userId = user?.id;

  const { signOut } = useClerk();
  const t = useTranslations('user');
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string || 'zh';

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  useEffect(() => {
    const effectUserId = user?.id;
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (effectUserId && userEmail && !syncStatusByUser[effectUserId]) {
      syncStatusByUser[effectUserId] = true;

      const userData = {
        google_id: effectUserId,
        email: userEmail,
        name: user.fullName,
        avatar: user.imageUrl,
      };

      const apiUrl = 'https://cartoon.framepola.com/api/user/registerOrUpdate';

      const syncUser = async () => {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API Error ${response.status}: ${errorData || response.statusText}`);
          }

          console.log('用户数据同步 API 调用成功:', await response.json());

        } catch (error) {
          console.error('用户数据同步 API 调用失败:', error);
        }
      };

      syncUser();
    }
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.imageUrl} alt={user.username || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              ID: {user.id.substring(0, 8)}...
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          asChild 
          className={`focus:bg-muted hover:bg-muted cursor-pointer ${
            pathname === `/${locale}/profile` ? 'bg-muted font-semibold' : ''
          }`}
        >
          <Link href={`/${locale}/profile`}>
            {t('profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-muted hover:bg-muted"
          onClick={() => {
            console.log('用户登出');
            signOut();
          }}
        >
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 