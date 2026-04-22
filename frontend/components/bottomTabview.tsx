'use client'

import { useState } from "react";
import Image from "next/image";

type Tab = {
  id: string;
  label: string;
  icon: string;
};

const tabs: Tab[] = [
  { id: "emails", label: "Emails", icon: "/icons/emails.svg" },
  { id: "subscriptions", label: "Subscriptions", icon: "/icons/subscriptions.svg" },
  { id: "info", label: "Info", icon: "/icons/info.svg" },
];

export default function BottomIconTabs() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className="tabs__bottom">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
          </button>
        );
      })}
    </div>
  );
}
