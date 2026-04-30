"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import IconTabs from "../tabview";
import ButtonIcon from "../buttons/iconButton";
import { useAppSelector } from '@/store/app/hooks';
import { selectAuthToken } from '@/store/features/auth/authSlice';

export default function Header() {
  const token = useAppSelector(selectAuthToken);
  const isLoggedIn = !!token;
  const pathname = usePathname();
  
  const shouldShowIconTabs = pathname === '/emails' || 
                              pathname === '/subscriptions' || 
                              pathname === '/info';

  return (
    <header className="nav-header">
      <div className="nav-header__container">

        <Link href="/" className="nav-header__logo">
          <Image
            src="/logos/logo.png"
            alt="logo"
            width={56}
            height={56}
            priority
          />
        </Link>

        {shouldShowIconTabs && (
          <div className="nav-header__desktop-tabs">
            <IconTabs />
          </div>
        )}

        <div className="nav-header__desktop-account">
          <ButtonIcon 
            icon='/icons/account.svg' 
            text={isLoggedIn ? "Account" : "Login"} 
            href={isLoggedIn ? "/profile" : "/login"} 
          />
        </div>

        <div className="nav-header__mobile-menu">
          <ButtonIcon 
            icon='/icons/account.svg' 
            text={isLoggedIn ? "Account" : "Login"} 
            href={isLoggedIn ? "/profile" : "/login"} 
          />
        </div>

      </div>
    </header>
  );
}