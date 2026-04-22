'use client'

import { useState, useRef, useEffect } from "react";
import {
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  FilmIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: string[]; // popup items
};

const tabs: Tab[] = [
  { id: "home", label: "Dashboard", icon: ChartBarSquareIcon, items: ["Overview", "Stats", "Reports"] },
  { id: "account", label: "Articles", icon: DocumentChartBarIcon, items: ["All Articles", "Drafts", "Create Article"] },
  { id: "media", label: "Media", icon: FilmIcon, items: ["Library", "Upload", "Folders"] },
  { id: "settings", label: "Schedules", icon: CalendarDaysIcon, items: ["My Schedule", "Upcoming", "History"] },
];

export default function IconTabsMobile() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const tabRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (id: string) => {
    if (activeTab === id) {
      setPopupOpen(!popupOpen);
    } else {
      setActiveTab(id);
      setPopupOpen(true);
    }
  };

  const activeTabObj = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="relative inline-block" ref={tabRef}>
      {/* Tab buttons */}
      <div className="menu-tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
            className={`menu-tabs__item ${isActive ? "menu-tabs__item--active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Popup */}
      {popupOpen && activeTabObj && (
        <div className="menu-tabs__popup">
          {activeTabObj.items.map((item, index) => (
            <button
              key={index}
              className="menu-tabs__popup-item"
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
