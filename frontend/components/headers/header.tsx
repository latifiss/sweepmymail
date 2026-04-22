"use client";

import Link from "next/link";
import Image from "next/image";
import IconTabs from "../tabview";
import ButtonIcon from "../buttons/iconButton";

export default function Header() {
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

        <div className="nav-header__desktop-tabs">
          <IconTabs />
        </div>

        <div className="nav-header__desktop-account">
          <ButtonIcon icon='/icons/account.svg' text="Account" href="/profile" />
        </div>

        <div className="nav-header__mobile-menu">
          <ButtonIcon icon='/icons/account.svg' text="Account" href="/profile" />
        </div>

      </div>
    </header>
  );
}
