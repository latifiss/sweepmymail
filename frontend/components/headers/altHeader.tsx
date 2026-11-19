"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  UpgradeIcon,
  LoginIcon,
  MenuIcon,
} from "@/public/icons/svg";
import { getBetterAuthSession } from "@/lib/auth-session";
import ProfileModal from "@/components/profileModal";

interface AuthUser {
  firstName: string;
  email: string;
  avatarUrl: string | null;
}

export default function AltHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    let mounted = true;

    getBetterAuthSession().then((session) => {
      if (!mounted) return;

      if (!session) {
        setUser(null);
        return;
      }

      setUser({
        firstName: session.user?.name ?? "Account",
        email: session.user?.email ?? "",
        avatarUrl: session.user?.image ?? null,
      });
    });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen]);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      setIsProfileOpen((open) => !open);
    }
  };

  const handleMenuClick = () => {
    window.dispatchEvent(new CustomEvent("alt-header:open-menu"));
  };

  return (
    <header className="alt-header">
      <div className="alt-header__inner">
        <div className="alt-header__actions">
          <button type="button" className="alt-header__upgrade">
            <UpgradeIcon />
            <span className="alt-header__upgrade-label">Upgrade To PRO</span>
          </button>

          <AuthButton
            user={user}
            isOpen={isProfileOpen}
            onClick={handleAuthClick}
            containerRef={profileRef}
          />
        </div>

        <div className="alt-header__actions__mobile">
          <AuthButton
            user={user}
            isOpen={isProfileOpen}
            onClick={handleAuthClick}
            containerRef={profileRef}
          />

          <button
            type="button"
            className="alt-header__actions__mobile__menu"
            aria-label="Open menu"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

interface AuthButtonProps {
  user: AuthUser | null;
  isOpen: boolean;
  onClick: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function AuthButton({ user, isOpen, onClick, containerRef }: AuthButtonProps) {
  const isLoggedIn = !!user;

  if (!isLoggedIn) {
    return (
      <Link href="/auth" className="alt-header__auth">
        <LoginIcon />
        <span className="alt-header__auth-label">Login/Signup</span>
      </Link>
    );
  }

  return (
    <div className="alt-header__auth-wrapper" ref={containerRef}>
      <button
        type="button"
        className="alt-header__auth"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <UserAvatar avatarUrl={user.avatarUrl} />
        <span className="alt-header__auth-label">{user.firstName}</span>
      </button>

      {isOpen && (
        <div className="alt-header__profile">
          <ProfileModal
            name={user.firstName}
            email={user.email}
            avatarUrl={user.avatarUrl}
            plan="free"
          />
        </div>
      )}
    </div>
  );
}

interface UserAvatarProps {
  avatarUrl: string | null;
}

function UserAvatar({ avatarUrl }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={24}
        height={24}
        className="alt-header__avatar"
        unoptimized
      />
    );
  }

  return (
    <span className="alt-header__avatar alt-header__avatar--fallback">
      <LoginIcon />
    </span>
  );
}