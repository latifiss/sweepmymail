"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import BaseButton from "@/components/buttons/baseButton";
import Simulation from "@/components/chat/simulation";
import {
  EmailsChipIcon,
  CategorizeChipIcon,
  ComposeChipIcon,
  ConfirmChipIcon,
  CreateChipIcon,
  DeleteChipIcon,
  DraftChipIcon,
  ForwardChipIcon,
  GeneralChipIcon,
  ImportantChipIcon,
  ListChipIcon,
  PrioritizeChipIcon,
  PriorityChipIcon,
  ReplyChipIcon,
  SaveChipIcon,
  ScheduleChipIcon,
  SendChipIcon,
  SummaryChipIcon,
  UnsubscribeChipIcon,
  ArchiveChipIcon,
  ApplyChipIcon,
  GmailIcon,
} from "@/public/icons/svg";
import { LinkedinGhostIcon, GmailGhostIcon } from "@/public/icons/svg";

const PRINCIPLES = [
  {
    number: "01",
    title: "integrate",
    description:
      "Connect your inbox in seconds. One click, one account, no setup wizards.",
  },
  {
    number: "02",
    title: "organize",
    description:
      "Every email gets read, categorized, and prioritized the moment it lands.",
  },
  {
    number: "03",
    title: "execute",
    description:
      "Draft replies, schedule follow-ups, and archive entire categories with a single command.",
  },
];

const STATS = [
  { value: "50K+", label: "Inboxes managed", color: "#70d690" },
  { value: "2.4M", label: "Emails processed", color: "#ffb200" },
  { value: "18%", label: "Smaller inboxes", color: "#fc7ec7" },
  { value: "2h", label: "Saved per user daily", color: "#5e44e9" },
];

const FAQS = [
  {
    number: "1",
    question: "What exactly does MagicMail do?",
    answer:
      "MagicMail is an AI agent that lives in your inbox. It reads every email, sorts it, and drafts replies so you don't have to. You keep using Gmail — we handle the noise in the background.",
  },
  {
    number: "2",
    question: "Is it safe to connect my Gmail account?",
    answer:
      "Yes. We use Google OAuth and never see your password. Your emails are processed through an encrypted pipeline and never used to train third-party models. You can revoke access anytime from your Google settings.",
  },
  {
    number: "3",
    question: "Does it work with email providers other than Gmail?",
    answer:
      "Gmail is supported today. Outlook is coming soon — email hello@mymagicmail.app to be notified when it's ready.",
  },
  {
    number: "4",
    question: "What does it cost?",
    answer:
      "Free covers 100 emails/month. Pro is $4.99/month for unlimited. Super is $9.99/month with extra features. No card required to start.",
  },
];

const BENTO_FEATURES = [
  {
    label: "Summarize",
    title: "Read less, know more.",
    description:
      "Every thread is condensed into a short, useful summary with sources. Skip the scroll, get the gist.",
    accent: "#70d690",
    Icon: SummaryChipIcon,
  },
  {
    label: "Categorize",
    title: "One rule, forever sorted.",
    description:
      "Define categories in plain language. MagicMail learns your rules once and applies them to every email after.",
    accent: "#fc7ec7",
    Icon: CategorizeChipIcon,
  },
  {
    label: "Draft",
    title: "Replies in your voice.",
    description:
      "MagicMail drafts answers that sound like you. Review, tweak, and send — usually in one tap.",
    accent: "#ffb200",
    Icon: DraftChipIcon,
  },
  {
    label: "Prioritize",
    title: "Only what matters, first.",
    description:
      "Time-sensitive mail surfaces immediately. Everything else waits quietly until you're ready.",
    accent: "#5e44e9",
    Icon: PrioritizeChipIcon,
  },
];

interface AboutFeature {
  heading: string;
  Icon: React.ComponentType<{ className?: string }>;
  body: Array<{ text: string; bold?: boolean }>;
}

const FEATURES: AboutFeature[] = [
  {
    heading: "Real unsubscribes",
    Icon: UnsubscribeChipIcon,
    body: [
      { text: "We follow unsubscribe links " },
      { text: "and actually unsubscribe you " },
      { text: "from emails. You'll never receive them again, even if you stop using our service." },
    ],
  },
  {
    heading: "Multiple accounts",
    Icon: EmailsChipIcon,
    body: [
      { text: "You can connect " },
      { text: "multiple ", bold: true },
      { text: "email accounts " },
      { text: "and see all your " },
      { text: "subscription emails together in a single place. No more tab switching!" },
    ],
  },
  {
    heading: "Multiple Rollups",
    Icon: SummaryChipIcon,
    body: [
      { text: "You can categorize your emails " },
      { text: "into up to 10 Rollups. These digests can be sent either daily or weekly on your custom schedule." },
    ],
  },
  {
    heading: "Block cold emails",
    Icon: DeleteChipIcon,
    body: [
      { text: "Tired of fake personal emails trying to sell you something? " },
      { text: "We'll block cold emails sent via mass-mailer tools from landing in your inbox." },
    ],
  },
  {
    heading: "Priority senders",
    Icon: PriorityChipIcon,
    body: [
      { text: "You want to receive some " },
      { text: "important emails immediately", bold: true },
    ],
  },
  {
    heading: "Do-not-disturb mode",
    Icon: ScheduleChipIcon,
    body: [
      { text: "Need time to focus? " },
      { text: "Our do-not-disturb mode holds onto your emails and delivers them when your focus time has finished." },
    ],
  },
  {
    heading: "Smart archive",
    Icon: ArchiveChipIcon,
    body: [
      { text: "Move old threads out of the way " },
      { text: "and only see what still matters. ", bold: true },
      { text: "Recover anything from the archive in one click." },
    ],
  },
  {
    heading: "Save drafts",
    Icon: SaveChipIcon,
    body: [
      { text: "Draft replies are saved automatically " },
      { text: "and pick up right where you left off. " },
      { text: "No more lost writing." },
    ],
  },
];

function InViewGate({
  children,
  rootMargin = "0px 0px -200px 0px",
  threshold = 0.15,
}: {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {isVisible && children}
    </div>
  );
}

function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ready, setReady] = useState(false);

  const leftPillRef = useRef<HTMLSpanElement>(null);
  const rightPillRef = useRef<HTMLSpanElement>(null);
  const leftViewportRef = useRef<HTMLSpanElement>(null);
  const rightViewportRef = useRef<HTMLSpanElement>(null);

  const leftPillWidthRef = useRef(0);
  const rightPillWidthRef = useRef(0);
  const leftViewportWidthRef = useRef(0);
  const rightViewportWidthRef = useRef(0);

  const TAG_PAIRS = [
    { left: "chaotic", right: "focused", leftColor: "#eb5757", rightColor: "#70d690" },
    { left: "cluttered", right: "calm", leftColor: "#fc7ec7", rightColor: "#70d690" },
    { left: "messy", right: "tidy", leftColor: "#ffb200", rightColor: "#5e44e9" },
    { left: "noisy", right: "clear", leftColor: "#ff591e", rightColor: "#2f80ed" },
  ];

  useLayoutEffect(() => {
    const pillL = leftPillRef.current;
    const viewportL = leftViewportRef.current;
    const pillR = rightPillRef.current;
    const viewportR = rightViewportRef.current;

    if (!pillL || !viewportL || !pillR || !viewportR) return;

    const leftPillWidth = pillL.offsetWidth;
    const leftViewportWidth = viewportL.offsetWidth;
    const rightPillWidth = pillR.offsetWidth;
    const rightViewportWidth = viewportR.offsetWidth;

    pillL.style.width = `${leftPillWidth}px`;
    viewportL.style.width = `${leftViewportWidth}px`;
    pillR.style.width = `${rightPillWidth}px`;
    viewportR.style.width = `${rightViewportWidth}px`;

    leftPillWidthRef.current = leftPillWidth;
    leftViewportWidthRef.current = leftViewportWidth;
    rightPillWidthRef.current = rightPillWidth;
    rightViewportWidthRef.current = rightViewportWidth;

    setReady(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(index);
      setIndex((i) => (i + 1) % TAG_PAIRS.length);
      setIsAnimating(true);
    }, 2800);

    return () => clearInterval(interval);
  }, [index]);

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setPrevIndex(-1);
    }, 340);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  useLayoutEffect(() => {
    if (!isAnimating || !ready) return;

    const animate = (
      pill: HTMLSpanElement | null,
      viewport: HTMLSpanElement | null,
      oldPillWidthRef: React.MutableRefObject<number>,
      oldViewportWidthRef: React.MutableRefObject<number>
    ) => {
      if (!pill || !viewport) return;

      const oldPillWidth = oldPillWidthRef.current;
      const oldViewportWidth = oldViewportWidthRef.current;

      pill.style.transition = "none";
      viewport.style.transition = "none";
      pill.style.width = "auto";
      viewport.style.width = "auto";

      const newPillWidth = pill.offsetWidth;
      const newViewportWidth = viewport.offsetWidth;

      pill.style.width = `${oldPillWidth}px`;
      viewport.style.width = `${oldViewportWidth}px`;

      void pill.offsetWidth;
      void viewport.offsetWidth;

      pill.style.transition = "width 320ms cubic-bezier(0.4, 0, 0.2, 1)";
      viewport.style.transition = "width 320ms cubic-bezier(0.4, 0, 0.2, 1)";
      pill.style.width = `${newPillWidth}px`;
      viewport.style.width = `${newViewportWidth}px`;

      oldPillWidthRef.current = newPillWidth;
      oldViewportWidthRef.current = newViewportWidth;
    };

    animate(
      leftPillRef.current,
      leftViewportRef.current,
      leftPillWidthRef,
      leftViewportWidthRef
    );
    animate(
      rightPillRef.current,
      rightViewportRef.current,
      rightPillWidthRef,
      rightViewportWidthRef
    );
  }, [isAnimating, index, ready]);

  useEffect(() => {
    if (!ready) return;

    const handleResize = () => {
      const pillL = leftPillRef.current;
      const viewportL = leftViewportRef.current;
      const pillR = rightPillRef.current;
      const viewportR = rightViewportRef.current;
      if (!pillL || !viewportL || !pillR || !viewportR) return;

      pillL.style.transition = "none";
      viewportL.style.transition = "none";
      pillR.style.transition = "none";
      viewportR.style.transition = "none";

      pillL.style.width = "auto";
      viewportL.style.width = "auto";
      pillR.style.width = "auto";
      viewportR.style.width = "auto";

      leftPillWidthRef.current = pillL.offsetWidth;
      leftViewportWidthRef.current = viewportL.offsetWidth;
      rightPillWidthRef.current = pillR.offsetWidth;
      rightViewportWidthRef.current = viewportR.offsetWidth;

      pillL.style.width = `${leftPillWidthRef.current}px`;
      viewportL.style.width = `${leftViewportWidthRef.current}px`;
      pillR.style.width = `${rightPillWidthRef.current}px`;
      viewportR.style.width = `${rightViewportWidthRef.current}px`;

      pillL.style.transition = "";
      viewportL.style.transition = "";
      pillR.style.transition = "";
      viewportR.style.transition = "";
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ready]);

  const current = TAG_PAIRS[index];
  const previous = prevIndex >= 0 ? TAG_PAIRS[prevIndex] : null;

  return (
    <div className="about-tagline">
      <div className="about-tagline__lead-line">An Email AI Agent that</div>

      <div className="about-tagline__row">
        <span className="about-tagline__text">transforms your</span>

        <span
          ref={leftPillRef}
          className="about-tagline__pill about-tagline__pill--left"
        >
          <span
            ref={leftViewportRef}
            className="about-tagline__pill-viewport"
          >
            {previous && isAnimating && (
              <span
                className="about-tagline__pill-word about-tagline__pill-word--outgoing about-tagline__pill-word--out"
                aria-hidden="true"
              >
                {previous.left}
              </span>
            )}

            <span
              className={`about-tagline__pill-word about-tagline__pill-word--current${
                isAnimating ? " about-tagline__pill-word--in" : ""
              }`}
            >
              {current.left}
            </span>
          </span>

          <span
            className="about-tagline__dot"
            style={{ ["--dot-color" as string]: current.leftColor }}
          />
        </span>

        <span className="about-tagline__text">inbox</span>
      </div>

      <div className="about-tagline__row">
        <span className="about-tagline__text">into a</span>

        <span
          ref={rightPillRef}
          className="about-tagline__pill about-tagline__pill--right"
        >
          <span
            className="about-tagline__dot"
            style={{ ["--dot-color" as string]: current.rightColor }}
          />

          <span
            ref={rightViewportRef}
            className="about-tagline__pill-viewport"
          >
            {previous && isAnimating && (
              <span
                className="about-tagline__pill-word about-tagline__pill-word--outgoing about-tagline__pill-word--out"
                aria-hidden="true"
              >
                {previous.right}
              </span>
            )}

            <span
              className={`about-tagline__pill-word about-tagline__pill-word--current${
                isAnimating ? " about-tagline__pill-word--in" : ""
              }`}
            >
              {current.right}
            </span>
          </span>
        </span>

        <span className="about-tagline__text">workspace</span>
      </div>
    </div>
  );
}

function BentoSummarizeMock() {
  return (
    <div className="bento-mock bento-mock--summarize">
      <div className="bento-mock__card">
        <span className="bento-mock__label">Today</span>
        <p className="bento-mock__title">
          You received 42 emails. 3 need a reply.
        </p>
        <ul className="bento-mock__list">
          <li>
            <span className="bento-mock__chip bento-mock__chip--green" />
            Alice — Q3 planning doc
          </li>
          <li>
            <span className="bento-mock__chip bento-mock__chip--yellow" />
            Stripe — Invoice paid
          </li>
          <li>
            <span className="bento-mock__chip bento-mock__chip--pink" />
            Marcus — Overdue #4821
          </li>
        </ul>
      </div>
    </div>
  );
}

function BentoCategorizeMock() {
  return (
    <div className="bento-mock bento-mock--categorize">
      <div className="bento-mock__card">
        <span className="bento-mock__label">Categories</span>
        <ul className="bento-mock__tags">
          <li className="bento-mock__tag bento-mock__tag--green">Work</li>
          <li className="bento-mock__tag bento-mock__tag--pink">Shopping</li>
          <li className="bento-mock__tag bento-mock__tag--yellow">News</li>
          <li className="bento-mock__tag bento-mock__tag--purple">Finance</li>
          <li className="bento-mock__tag bento-mock__tag--green">Career</li>
          <li className="bento-mock__tag bento-mock__tag--purple">Personal</li>
        </ul>
      </div>
    </div>
  );
}

function BentoDraftMock() {
  return (
    <div className="bento-mock bento-mock--draft">
      <div className="bento-mock__card bento-mock__card--draft">
        <span className="bento-mock__label">Draft to Alice</span>
        <p className="bento-mock__draft-line">Hi Alice,</p>
        <p className="bento-mock__draft-line">
          Thanks for the updated draft — the structure looks solid.
        </p>
        <p className="bento-mock__draft-line">
          I'll add a Q4 section and send it back Friday.
        </p>
        <div className="bento-mock__cursor" />
      </div>
    </div>
  );
}

function BentoPrioritizeMock() {
  return (
    <div className="bento-mock bento-mock--prioritize">
      <div className="bento-mock__card">
        <span className="bento-mock__label">Priority</span>
        <ul className="bento-mock__priority-list">
          <li className="bento-mock__priority-item bento-mock__priority-item--high">
            <span className="bento-mock__priority-bar" />
            Reply to Alice — due today
          </li>
          <li className="bento-mock__priority-item bento-mock__priority-item--mid">
            <span className="bento-mock__priority-bar" />
            Pay invoice #4821
          </li>
          <li className="bento-mock__priority-item bento-mock__priority-item--low">
            <span className="bento-mock__priority-bar" />
            14 newsletters — read later
          </li>
        </ul>
      </div>
    </div>
  );
}

function BentoSection() {
  const mocks = [
    <BentoSummarizeMock key="summarize" />,
    <BentoCategorizeMock key="categorize" />,
    <BentoDraftMock key="draft" />,
    <BentoPrioritizeMock key="prioritize" />,
  ];

  return (
    <section className="about-bento">
      <div className="about-bento__inner">
        <header className="about-bento__header">
          <span className="about-bento__label">what you get</span>
          <h2 className="about-bento__title">
            Everything your inbox
            <br />
            should already do.
          </h2>
          <p className="about-bento__lead">
            Four tools that quietly take the work out of email — and put the
            things that matter back in front of you.
          </p>
        </header>

        <ul className="about-bento__grid">
          {BENTO_FEATURES.map((feature, index) => {
            const Icon = feature.Icon;
            return (
              <li
                key={feature.label}
                className="about-bento__card"
                style={{ ["--accent-color" as string]: feature.accent }}
              >
                <div className="about-bento__card-content">
                  <span className="about-bento__card-label">
                    {feature.label}
                  </span>
                  <h3 className="about-bento__card-title">{feature.title}</h3>
                  <p className="about-bento__card-description">
                    {feature.description}
                  </p>
                </div>

                <div className="about-bento__card-visual">
                  {mocks[index]}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="about-features">
      <div className="about-features__inner">
        <ul className="about-features__list">
          {FEATURES.map((feature) => {
            const Icon = feature.Icon;
            return (
              <li key={feature.heading} className="about-feature">
                <div className="about-feature__icon">
                  <Icon />
                </div>

                <h3 className="about-feature__title">{feature.heading}</h3>

                <p className="about-feature__body">
                  {feature.body.map((part, index) => (
                    <span
                      key={index}
                      className={
                        part.bold ? "about-feature__strong" : undefined
                      }
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function FaqItem({
  number,
  question,
  answer,
}: {
  number: string;
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const [answerHeight, setAnswerHeight] = useState(0);

  useLayoutEffect(() => {
    if (!answerRef.current) return;

    const el = answerRef.current;
    const update = () => setAnswerHeight(el.scrollHeight);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [answer]);

  return (
    <div
      className={`about-faq-item${isOpen ? " about-faq-item--open" : ""}`}
    >
      <div className="about-faq-item__row">
        <div className="about-faq-item__left">
          <span className="about-faq-item__number">{number}</span>
          <h3 className="about-faq-item__question">{question}</h3>
        </div>

        <button
          type="button"
          className="about-faq-item__toggle"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide answer" : "Show answer"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <div
        className="about-faq-item__body"
        style={{ maxHeight: isOpen ? `${answerHeight}px` : "0px" }}
        aria-hidden={!isOpen}
      >
        <div ref={answerRef} className="about-faq-item__body-inner">
          <p className="about-faq-item__answer">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 5C6.5 5 2.5 9.5 1 12c1.5 2.5 5.5 7 11 7s9.5-4.5 11-7c-1.5-2.5-5.5-7-11-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.1A10.9 10.9 0 0 1 12 6c5.5 0 9.5 4.5 11 6a15.3 15.3 0 0 1-3.3 3.7M6.5 6.5C4.6 7.9 3 10 2 12c1.5 2.5 5.5 7 11 7 1.6 0 3-.3 4.3-.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a3.5 3.5 0 0 0 5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero__inner">
          <Image
            src="/logos/logo.png"
            alt="MagicMail"
            width={90}
            height={90}
            className="about-hero__logo"
            priority
          />

          <RotatingHeadline />

          <div className="about-hero__actions">
            <Link href="/auth" className="about-hero__cta">
              <BaseButton variant="default">Try it for free</BaseButton>
            </Link>
            <Link href="/pricing" className="about-hero__cta-secondary">
              See pricing →
            </Link>
          </div>
        </div>
      </section>

      <section className="about-demo">
        <div className="about-demo__inner">
          <header className="about-demo__header">
            <span className="about-demo__label">see it in action</span>
            <h2 className="about-demo__title">Watch the agent work.</h2>
          </header>

          <div className="about-demo__frame">
            <InViewGate>
              <Simulation />
            </InViewGate>
          </div>
        </div>
      </section>

      <section className="about-agent">
        <div className="about-agent__inner">
          <div className="about-agent__block">
            <h2 className="about-agent__title">
              Most inbox tools overwhelm you with features. MagicMail just reads, sorts, and replies.
            </h2>
          </div>

          <div className="about-agent__block">
            <p className="about-agent__body">
              It lives quietly inside your inbox and works in the background. <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><CategorizeChipIcon /></span> Every new email
              </span>{" "}
              is read, understood, and routed the moment it arrives. <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><ListChipIcon /></span> Newsletters,
              </span>{" "}
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><ConfirmChipIcon /></span> receipts,
              </span>{" "}
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><GeneralChipIcon /></span> notifications,
              </span>{" "}
              and{" "}
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><ApplyChipIcon /></span> follow-ups
              </span>{" "}
              <br />
              get summarized, tagged, and filed away — so the only thing left in your inbox is what actually needs you.
            </p>
          </div>

          <div className="about-agent__block">
            <p className="about-agent__body">
              Setting up takes about a minute. <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper">
                  <GmailIcon />
                </span>{" "}
                Connect your Gmail
              </span>{" "}
              <br />
              and the agent starts working immediately — <br />
              no new inbox to learn, no app to check, no forwarding rules to configure.
            </p>
          </div>

          <div className="about-agent__block">
            <p className="about-agent__body">
              When something needs a reply, MagicMail drafts one in your voice. <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><ComposeChipIcon /></span> Review the draft,
              </span>{" "}
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><ReplyChipIcon /></span> reply in one tap,
              </span>{" "}
              or <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><ForwardChipIcon /></span> forward it
              </span>{" "}
              to someone else — either way, it's out the door in seconds.
            </p>
          </div>

          <div className="about-agent__block">
            <p className="about-agent__body">
              The more you use it, the sharper it gets. <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><ImportantChipIcon /></span> Important senders
              </span>{" "}
              are learned, <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><PriorityChipIcon /></span> priorities
              </span>{" "}
              are refined, <br />
              and <br />
              <span className="about-agent__inline-icon">
                <span className="about-agent__icon-wrapper"><CreateChipIcon /></span> new rules
              </span>{" "}
              are created for you — so your inbox quietly turns into the calmest, most useful place it's ever been.
            </p>
          </div>
        </div>
      </section>

      <section className="about-founder">
        <div className="about-founder__inner">
          <h2 className="about-founder__title">Meet the founder</h2>

          <div className="about-founder__card">
            <div className="about-founder__content">
              <div className="about-founder__avatar">
                <Image
                  src="/assets/latifissaka-headshot.jpg"
                  alt="Latif Issaka"
                  width={126}
                  height={126}
                />
              </div>

              <div className="about-founder__info">
                <h3 className="about-founder__name">Latif Issaka</h3>
                <p className="about-founder__role">Product Engineer</p>
              </div>
            </div>

            <div className="about-founder__socials">
              <a href="#" className="about-founder__social-link" aria-label="LinkedIn">
                <LinkedinGhostIcon />
              </a>
              <a href="#" className="about-founder__social-link" aria-label="Gmail">
                <GmailGhostIcon />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}