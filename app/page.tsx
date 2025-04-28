import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en'); // 默认重定向到英文页面
  return null;
}
