'use client';

import { usePathname } from "next/navigation";
import BottomIconTabs from '@/components/tabviewMobile';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const shouldShowBottomTabs = pathname === '/emails' || 
                                pathname === '/subscriptions' || 
                                pathname === '/info';
  
  return (
    <>
      {children}
      {shouldShowBottomTabs && <BottomIconTabs />}
    </>
  );
}