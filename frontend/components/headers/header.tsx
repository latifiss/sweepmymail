"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import IconTabs from "../tabview";
import ButtonIcon from "../buttons/iconButton";
import { getBetterAuthSession } from '@/lib/auth-session';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const shouldShowIconTabs = pathname === '/emails' ||
                              pathname === '/subscriptions' ||
                              pathname === '/info';

  useEffect(() => {
    let mounted = true;

    getBetterAuthSession().then((session) => {
      if (mounted) setIsLoggedIn(!!session);
    });

    return () => {
      mounted = false;
    };
  }, [pathname]);

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