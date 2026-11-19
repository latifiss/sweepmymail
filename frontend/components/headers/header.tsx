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
import Sidebar from "@/components/sidebar";
import Cupboard from "@/components/cupboard";

interface AuthUser {
  firstName: string;
  email: string;
  avatarUrl: string | null;
}

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!user;
  const isAboutPage = pathname === "/about";

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

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      setIsProfileOpen((open) => !open);
    }
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="nav-header">
        <div className="nav-header__inner">
          <Link href="/" className="nav-header__logo" aria-label="Magic Mail Logo">
            <Image
              src="/logos/logo.png"
              alt="Magic Mail Logo"
              width={40}
              height={40}
              unoptimized
            />
          </Link>

          <div className="nav-header__actions">
            {isAboutPage ? (
              <Link href="/pricing" className="nav-header__pricing">
                <span className="nav-header__upgrade-label">Pricing</span>
              </Link>
            ) : (
              <button type="button" className="nav-header__upgrade">
                <UpgradeIcon />
                <span className="nav-header__upgrade-label">Upgrade To PRO</span>
              </button>
            )}

            <AuthButton
              user={user}
              isOpen={isProfileOpen}
              onClick={handleAuthClick}
              containerRef={profileRef}
            />
          </div>

          <div className="nav-header__actions__mobile">
            <AuthButton
              user={user}
              isOpen={isProfileOpen}
              onClick={handleAuthClick}
              containerRef={profileRef}
            />

            <button
              type="button"
              className="nav-header__actions__mobile__menu"
              aria-label="Open menu"
              onClick={handleMenuClick}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      <SidebarDrawer isOpen={isSidebarOpen} onClose={handleSidebarClose} />
    </>
  );
}

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCupboardOpen, setIsCupboardOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
        setIsCupboardOpen(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div
      className={`sidebar-drawer${isVisible ? " sidebar-drawer--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div
        className="sidebar-drawer__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="sidebar-drawer__viewport">
        <div
          className={`sidebar-drawer__track${
            isCupboardOpen ? " sidebar-drawer__track--cupboard" : ""
          }`}
        >
          <div className="sidebar-drawer__panel">
            <Sidebar
              plan="free"
              onClose={onClose}
              onNewChat={() => console.log("new chat")}
              onCupboard={() => setIsCupboardOpen(true)}
              onSelectChat={(id) => console.log("select", id)}
              onUpgrade={() => console.log("upgrade")}
            />
          </div>

          <div className="sidebar-drawer__cupboard">
            <Cupboard onClose={() => setIsCupboardOpen(false)} />
          </div>
        </div>
      </div>
    </div>
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
      <Link href="/auth" className="nav-header__auth">
        <LoginIcon />
        <span className="nav-header__auth-label">Login/Signup</span>
      </Link>
    );
  }

  return (
    <div className="nav-header__auth-wrapper" ref={containerRef}>
      <button
        type="button"
        className="nav-header__auth"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <UserAvatar avatarUrl={user.avatarUrl} />
        <span className="nav-header__auth-label">{user.firstName}</span>
      </button>

      {isOpen && (
        <div className="nav-header__profile">
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
        className="nav-header__avatar"
        unoptimized
      />
    );
  }

  return (
    <span className="nav-header__avatar nav-header__avatar--fallback">
      <LoginIcon />
    </span>
  );
}