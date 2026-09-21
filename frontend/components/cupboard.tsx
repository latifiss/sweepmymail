"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  EmailsIcon,
  CategorizeIcon,
  SummaryIcon,
  PrioritizeIcon,
  DownIcon,
  CupboardIcon,
} from "@/public/icons/svg";

export interface CupboardProps {
  email?: string;
  mailsCount?: number;
  categoriesCount?: number;
  priorityCount?: number;
  categories?: string[];
  summaryDates?: string[];
  priorities?: string[];
  onClose?: () => void;
  className?: string;
}

const DEFAULT_CATEGORIES = [
  "news",
  "career",
  "shopping",
  "tech",
  "marketing",
  "policy",
  "sales",
];

const DEFAULT_SUMMARY_DATES = [
  "17th July 2026 12:38am",
  "16th July 2026 09:12pm",
  "15th July 2026 02:47pm",
];

const DEFAULT_PRIORITIES = [
  "urgent",
  "invoices",
  "client",
  "deadline",
  "meeting",
];

export default function Cupboard({
  email = "example@mail.com",
  mailsCount = 132,
  categoriesCount = 183,
  priorityCount = 56,
  categories = DEFAULT_CATEGORIES,
  summaryDates = DEFAULT_SUMMARY_DATES,
  priorities = DEFAULT_PRIORITIES,
  onClose,
  className,
}: CupboardProps): ReactNode {
  const rootClassName = className ? `cupboard ${className}` : "cupboard";

  return (
    <aside className={rootClassName} aria-label="Your cupboard">
      <header className="cupboard__header">
        <div className="cupboard__identity">
          <CupboardIcon />
          <div className="cupboard__identity-text">
            <span className="cupboard__title">Your Cupboard</span>
            <span className="cupboard__email">{email}</span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="cupboard__close"
            aria-label="Close cupboard"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        )}
      </header>

      <AccordionItem
        icon={<EmailsIcon />}
        title="emails"
        subtitle={`${mailsCount} mails`}
        meta="Last 24 hours"
        isAccordion={false}
      />

      <AccordionItem
        icon={<CategorizeIcon />}
        title="categorize"
        subtitle={`${categoriesCount} Categories`}
      >
        <ul className="cupboard__category-list">
          {categories.map((cat) => (
            <li key={cat} className="cupboard__category-item">
              {cat}
            </li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem
        icon={<SummaryIcon />}
        title="summary"
        subtitle="Summary List"
      >
        <ul className="cupboard__category-list">
          {summaryDates.map((date) => (
            <li key={date} className="cupboard__category-item">
              {date}
            </li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem
        icon={<PrioritizeIcon />}
        title="prioritize"
        subtitle={`${priorityCount} Priority Keywords`}
      >
        <ul className="cupboard__category-list">
          {priorities.map((keyword) => (
            <li key={keyword} className="cupboard__category-item">
              {keyword}
            </li>
          ))}
        </ul>
      </AccordionItem>
    </aside>
  );
}

interface AccordionItemProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  meta?: string;
  defaultOpen?: boolean;
  isAccordion?: boolean;
  children?: ReactNode;
}

function AccordionItem({
  icon,
  title,
  subtitle,
  meta,
  defaultOpen = false,
  isAccordion = true,
  children,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number>(0);

  useLayoutEffect(() => {
    if (!bodyRef.current) return;

    const el = bodyRef.current;
    const update = () => setBodyHeight(el.scrollHeight);

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  const handleToggle = () => {
    if (isAccordion) setIsOpen((open) => !open);
  };

  const hasBody = isAccordion && !!children;

  return (
    <section
      className={`cupboard__item${isOpen ? " cupboard__item--open" : ""}`}
    >
      <button
        type="button"
        className="cupboard__item-trigger"
        onClick={handleToggle}
        aria-expanded={isAccordion ? isOpen : undefined}
        disabled={!isAccordion}
      >
        <span className="cupboard__item-heading">
          <span className="cupboard__item-icon">{icon}</span>
        </span>

        <span className="cupboard__item-meta-row">
          <span className="cupboard__item-subtitle">{subtitle}</span>
          {isAccordion && (
            <span
              className={`cupboard__item-chevron${
                isOpen ? " cupboard__item-chevron--open" : ""
              }`}
            >
              <DownIcon />
            </span>
          )}
          {!isAccordion && meta && (
            <span className="cupboard__item-meta">{meta}</span>
          )}
        </span>
      </button>

      {hasBody && (
        <div
          className="cupboard__item-body"
          style={{ maxHeight: isOpen ? `${bodyHeight}px` : "0px" }}
          aria-hidden={!isOpen}
        >
          <div ref={bodyRef} className="cupboard__item-body-inner">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}

function CupboardBrandIcon() {
  return (
    <span className="cupboard__brand-icon" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M7 0L8.6 3.4L12 2L10.6 5.4L14 7L10.6 8.6L12 12L8.6 10.6L7 14L5.4 10.6L2 12L3.4 8.6L0 7L3.4 5.4L2 2L5.4 3.4L7 0Z"
          fill="#6FCF97"
        />
      </svg>
    </span>
  );
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