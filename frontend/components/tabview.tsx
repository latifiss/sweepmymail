'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Tab = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

const tabs: Tab[] = [
  { id: "emails", label: "Emails", icon: "/icons/emails.svg", href: "/emails" },
  { id: "subscriptions", label: "Subscriptions", icon: "/icons/subscriptions.svg", href: "/subscriptions" },
  { id: "info", label: "Info", icon: "/icons/info.svg", href: "/info" },
];

export default function IconTabs() {
  const pathname = usePathname();

  return (
    <div className="tabs">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`tabs__tab ${isActive ? "tabs__tab--active" : ""}`}
          >
            <Image
              src={tab.icon}
              alt={tab.label}
              width={20}
              height={20}
              className="tabs__tab__icon"
            />
            <span className="tabs__tab__label font-gliker">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
