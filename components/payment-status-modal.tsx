'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';

export default function PaymentStatusModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: { en: '', zh: '' },
    message: { en: '', zh: '' },
    buttonText: { en: 'Confirm', zh: '确认' }
  });
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [preferredLang, setPreferredLang] = useState('en');

  useEffect(() => {
    const urlLocale = params.locale as string | undefined;
    let determinedLang = 'en';

    if (urlLocale === 'zh') {
      determinedLang = 'zh';
    } else if (urlLocale === 'en') {
      determinedLang = 'en';
    } else {
      if (typeof navigator !== "undefined") {
        determinedLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
      }
    }
    setPreferredLang(determinedLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.locale]);

  useEffect(() => {
    const paysuccess = searchParams.get('paysuccess');
    const payfail = searchParams.get('payfail');
    let content = {
      title: { en: '', zh: '' },
      message: { en: '', zh: '' },
      buttonText: { en: 'Confirm', zh: '确认' }
    };
    let shouldOpenModal = false;
    let successState: boolean | null = null;

    if (paysuccess === '1') {
      content = {
        title: { en: 'Success', zh: '订阅成功' },
        message: { en: 'Subscription successful! Welcome aboard.', zh: '订阅成功！欢迎加入。' },
        buttonText: { en: 'Confirm', zh: '确认' }
      };
      shouldOpenModal = true;
      successState = true;
    } else if (payfail === '1') {
      content = {
        title: { en: 'Failed', zh: '订阅失败' },
        message: { en: 'Subscription failed. Please check your payment details or try again.', zh: '订阅失败。请检查您的支付信息或重试。' },
        buttonText: { en: 'Confirm', zh: '确认' }
      };
      shouldOpenModal = true;
      successState = false;
    }

    if (shouldOpenModal) {
      setModalContent(content);
      setIsSuccess(successState);
      setIsModalOpen(true);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('paysuccess');
      newParams.delete('payfail');
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false }); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname, router]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getLocalizedText = (textObj: { en: string; zh: string }) => {
    return preferredLang === 'zh' ? textObj.zh : textObj.en;
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="relative z-50 w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-2">
          {getLocalizedText(modalContent.title)}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getLocalizedText(modalContent.message)}
          </p>
        </div>
        <div className="mt-5 sm:mt-6">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
            onClick={closeModal}
          >
            {getLocalizedText(modalContent.buttonText)}
          </button>
        </div>
      </div>
    </div>
  );
} 