import {notFound} from 'next/navigation';

export async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export default async function getRequestMessages({locale}: {locale: string}) {
  return {
    messages: await getMessages(locale),
    timeZone: 'Asia/Shanghai'
  };
} 