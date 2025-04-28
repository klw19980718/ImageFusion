'use client';

import { SignUp } from '@clerk/nextjs';
import { useParams } from 'next/navigation';

export default function SignUpPage() {
  const params = useParams();
  const locale = params.locale as string || 'zh';

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#FFB347] hover:bg-[#F67280]',
            card: 'bg-white shadow-md'
          }
        }}
      />
    </div>
  );
} 