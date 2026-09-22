"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  ChatIcon,
  CupboardIcon,
  HistoryIcon,
  UpgradeIcon,
  RightIcon,
} from "@/public/icons/svg";

export type PlanTier = "free" | "pro" | "super";

export interface SidebarChatItem {
  id: string;
  label: string;
}

export interface SidebarProps {
  chats?: SidebarChatItem[];
  plan?: PlanTier;
  onClose?: () => void;
  onNewChat?: () => void;
  onCupboard?: () => void;
  onSelectChat?: (id: string) => void;
  onUpgrade?: () => void;
  className?: string;
}

const DEFAULT_CHATS: SidebarChatItem[] = [
  { id: "1", label: "Please add 'shopping' to my list." },
  { id: "2", label: "Could you include 'shopping' in my list?" },
  { id: "3", label: "Please add 'shopping' to my categories." },
  { id: "4", label: "Make sure to add 'shopping' to my list." },
  { id: "5", label: "Add 'shopping' to my categories, please." },
  { id: "6", label: "Please ensure 'shopping' is included in my list." },
  { id: "7", label: "If possible, please add 'shopping' for me." },
  { id: "8", label: "Could you please add 'shopping' for me?" },
  { id: "9", label: "Add 'shopping' to my list, if you could." },
  { id: "10", label: "Can you include 'shopping' in my list?" },
  { id: "11", label: "Make sure to include 'shopping' in my list." },
  { id: "12", label: "Could you include 'shopping' in my list, please?" },
  { id: "13", label: "Please ensure 'shopping' is added." },
  { id: "14", label: "I would like to request the addition of 'shopping'." },
  { id: "15", label: "Kindly add 'shopping' to my list for me." },
];

export default function Sidebar({
  chats = DEFAULT_CHATS,
  plan = "free",
  onClose,
  onNewChat,
  onCupboard,
  onSelectChat,
  onUpgrade,
  className,
}: SidebarProps): ReactNode {
  const rootClassName = className ? `sidebar ${className}` : "sidebar";

  return (
    <aside className={rootClassName} aria-label="Chat sidebar">
      <div className="sidebar__top">
        <header className="sidebar__header">
          <Image
            src="/logos/logo.png"
            alt="Magic Mail Logo"
            width={40}
            height={40}
            unoptimized
          />

          {onClose && (
            <button
              type="button"
              className="sidebar__close"
              aria-label="Close sidebar"
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          )}
        </header>

        <div className="sidebar__body">
          <nav className="sidebar__nav" aria-label="Sidebar navigation">
            <button
              type="button"
              className="sidebar__nav-item"
              onClick={onNewChat}
            >
              <ChatIcon />
              <span className="sidebar__nav-label">New Chat</span>
            </button>

            <button
              type="button"
              className="sidebar__nav-item sidebar__nav-item--between"
              onClick={onCupboard}
            >
              <span className="sidebar__nav-item-left">
                <CupboardIcon />
                <span className="sidebar__nav-label">Cupboard</span>
              </span>
              <span className="sidebar__nav-item-right">
                <RightIcon />
              </span>
            </button>
          </nav>

          <div className="sidebar__history">
            <header className="sidebar__history-header">
              <HistoryIcon />
              <span className="sidebar__history-title">History</span>
            </header>

            <ul className="sidebar__history-list">
              {chats.map((chat) => (
                <li key={chat.id} className="sidebar__history-item">
                  <button
                    type="button"
                    className="sidebar__history-link"
                    onClick={() => onSelectChat?.(chat.id)}
                    title={chat.label}
                  >
                    {chat.label}
                  </button>
                  {(onRenameChat || onDeleteChat) && (
                    <span className="sidebar__history-actions">
                      {onRenameChat && <button type="button" aria-label={"Rename " + chat.label} onClick={() => onRenameChat(chat.id)}>Rename</button>}
                      {onDeleteChat && <button type="button" aria-label={"Delete " + chat.label} onClick={() => onDeleteChat(chat.id)}>Delete</button>}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="sidebar__footer">
        <button
          type="button"
          className="sidebar__upgrade"
          onClick={onUpgrade}
        >
          <UpgradeIcon />
          <span className="sidebar__upgrade-text">
            <span className="sidebar__upgrade-title">Upgrade To PRO</span>
            <span className="sidebar__upgrade-subtitle">
              You&apos;re on {planLabel(plan)}
            </span>
          </span>
        </button>
      </footer>
    </aside>
  );
}

function planLabel(plan: PlanTier): string {
  if (plan === "pro") return "Pro";
  if (plan === "super") return "Super";
  return "Free";
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 2L14 14M14 2L2 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}