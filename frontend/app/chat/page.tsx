"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AltHeader from "@/components/headers/altHeader";
import Sidebar from "@/components/sidebar";
import Cupboard from "@/components/cupboard";
import PromptInput from "@/components/promptInput";
import UserMessage from "@/components/chat/userMessage";
import ChatResponse from "@/components/chat/chatResponse";
import ThinkingIndicator from "@/components/chat/thinkingIndicator";
import type {
  ResponseAction,
  ResponseBlock,
} from "@/components/chat/chat-response-types";

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "agent"; response: ResponseBlock };

const THINKING_STAGES: Record<string, string[]> = {
  summary: [
    "Scanning your inbox",
    "Reading emails",
    "Extracting key points",
    "Building summary",
    "Preparing sources",
  ],
  "email-list": [
    "Scanning your inbox",
    "Filtering unread",
    "Sorting by date",
    "Preparing list",
  ],
  draft: [
    "Reviewing conversation",
    "Choosing tone",
    "Writing draft",
    "Formatting message",
    "Preparing preview",
  ],
  schedule: [
    "Checking calendar",
    "Finding open slots",
    "Confirming timezone",
    "Preparing event",
  ],
  confirm: [
    "Analyzing request",
    "Estimating impact",
    "Preparing confirmation",
  ],
  text: [
    "Thinking",
    "Reading your inbox",
    "Preparing response",
  ],
};

const DEFAULT_STAGES = [
  "Thinking",
  "Reading your inbox",
  "Preparing response",
];

function stagesFor(prompt: string): string[] {
  const p = prompt.toLowerCase();
  if (p.includes("summary") || p.includes("summarize")) return THINKING_STAGES.summary;
  if (p.includes("draft") || p.includes("compose") || p.includes("reply")) return THINKING_STAGES.draft;
  if (p.includes("archive") || p.includes("delete") || p.includes("clean")) return THINKING_STAGES.confirm;
  if (p.includes("schedule") || p.includes("remind")) return THINKING_STAGES.schedule;
  if (p.includes("email") || p.includes("inbox") || p.includes("unread")) return THINKING_STAGES["email-list"];
  return THINKING_STAGES.text;
}

function fakeAgentReply(prompt: string): ResponseBlock {
  const p = prompt.toLowerCase();

  if (p.includes("summary") || p.includes("summarize")) {
    return {
      kind: "summary",
      lead: "For the past 24 hours, 28 people sent you emails. Here's the summary:",
      title: "Your week in review",
      content:
        "You received 42 emails this week [1]. Twelve were replies to threads you started [2]. Three invoices came through, one of which is overdue [3]. Overall, your inbox is 18% smaller than last week.",
      citations: [
        {
          id: "e_201",
          sender: "Inbox Digest",
          senderEmail: "digest@magicmail.app",
          subject: "Weekly totals",
          preview: "42 received · 28 read · 14 unread",
          receivedAt: "2026-09-19T08:00:00Z",
        },
        {
          id: "e_202",
          sender: "Alice Johnson",
          senderEmail: "alice@example.com",
          subject: "Re: Q3 planning doc",
          preview: "Thanks for sending the draft — one small correction...",
          receivedAt: "2026-09-18T14:32:00Z",
        },
        {
          id: "e_203",
          sender: "Marcus Reid",
          senderEmail: "marcus@acme.co",
          subject: "Invoice #4821 overdue",
          preview: "Just a heads-up that this invoice is now 5 days past due...",
          receivedAt: "2026-09-18T09:15:00Z",
        },
      ],
    };
  }

  if (p.includes("draft") || p.includes("compose") || p.includes("reply")) {
    return {
      kind: "draft",
      lead: "I've drafted a reply. Take a look:",
      draft: {
        id: `d_${Date.now()}`,
        to: "team@acme.com",
        subject: "Standup notes — Sep 20",
        body: "Hi team,\n\nHere are today's notes:\n- Shipped the auth fix\n- Blocked on the pricing design\n- Alice will review tomorrow\n\nBest,\nJohn",
      },
    };
  }

  if (p.includes("archive") || p.includes("delete") || p.includes("clean")) {
    return {
      kind: "confirm",
      lead: "I can archive all 42 promotions emails. Want me to?",
      promptId: `p_${Date.now()}`,
      question: "Archive all 42 emails from the promotions category?",
    };
  }

  if (p.includes("schedule") || p.includes("remind")) {
    return {
      kind: "schedule",
      lead: "Here's a time that works for you and Alice.",
      event: {
        id: `s_${Date.now()}`,
        title: "Follow-up with Alice",
        when: "Tomorrow, 2:00 PM",
        duration: "30 minutes",
      },
    };
  }

  if (p.includes("email") || p.includes("inbox") || p.includes("unread")) {
    return {
      kind: "email-list",
      lead: "Here are the unread emails from the past 24 hours.",
      title: "Unread from this week",
      emails: [
        {
          id: "e_101",
          sender: "Alice Johnson",
          senderEmail: "alice@example.com",
          subject: "Q3 planning doc",
          preview:
            "Hey, attached is the draft we discussed. Let me know what you think...",
          receivedAt: "2026-09-18T14:32:00Z",
        },
        {
          id: "e_102",
          sender: "Marcus Reid",
          senderEmail: "marcus@acme.co",
          subject: "Invoice #4821 overdue",
          preview:
            "Just a heads-up that this invoice is now 5 days past due. Could you...",
          receivedAt: "2026-09-18T09:15:00Z",
        },
        {
          id: "e_103",
          sender: "Support Team",
          senderEmail: "support@saas.io",
          subject: "Your trial ends in 3 days",
          preview:
            "Your 14-day trial ends on September 22. Upgrade to keep access to...",
          receivedAt: "2026-09-17T22:04:00Z",
        },
      ],
    };
  }

  return {
    kind: "text",
    lead: "Let me check your inbox.",
    content:
      "I've categorized 132 emails from this week. Three of them look time-sensitive and I've flagged them for you.",
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isCupboardOpen, setIsCupboardOpen] = useState(false);
  const [thinkingStages, setThinkingStages] = useState<string[] | null>(null);
  const [pendingResponse, setPendingResponse] = useState<ResponseBlock | null>(null);

  const threadRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const isEmpty = messages.length === 0 && !thinkingStages && !pendingResponse;

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < 40;
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!shouldAutoScrollRef.current) return;
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, thinkingStages]);

  const handleThinkingComplete = useCallback(() => {
    if (!pendingResponse) return;

    const agentMessage: ChatMessage = {
      id: `a_${Date.now()}`,
      role: "agent",
      response: pendingResponse,
    };

    setMessages((prev) => [...prev, agentMessage]);
    setThinkingStages(null);
    setPendingResponse(null);
  }, [pendingResponse]);

  const handleSubmit = useCallback((content: string) => {
    if (!content.trim()) return;

    shouldAutoScrollRef.current = true;

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);

    const response = fakeAgentReply(content);
    setPendingResponse(response);
    setThinkingStages(stagesFor(content));
  }, []);

  const handleAction = useCallback((action: ResponseAction) => {
    shouldAutoScrollRef.current = true;
    const label = actionLabel(action);

    const echoMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: label,
    };

    setMessages((prev) => [...prev, echoMessage]);

    const response: ResponseBlock = {
      kind: "text",
      lead: "Got it.",
      content: `You chose "${label}". I'll take care of that now.`,
    };

    setPendingResponse(response);
    setThinkingStages([
      "Acknowledging",
      "Processing request",
      "Preparing response",
    ]);
  }, []);

  return (
    <div className="chat-page">
      <div className="chat-page__body">
        <div className="chat-page__rail">
          <Sidebar
            plan="free"
            onNewChat={() => setMessages([])}
            onCupboard={() => setIsCupboardOpen(true)}
            onSelectChat={(id) => console.log("select chat", id)}
            onUpgrade={() => console.log("upgrade")}
          />

          <div
            className={`chat-page__cupboard${
              isCupboardOpen ? " chat-page__cupboard--open" : ""
            }`}
          >
            <Cupboard
              email="example@mail.com"
              onClose={() => setIsCupboardOpen(false)}
            />
          </div>
        </div>

        <div className="chat-page__main">
          <div className="chat-page__header">
            <AltHeader />
          </div>

          {isEmpty ? (
            <div className="chat-page__empty">
              <div className="chat-page__empty-greeting">
                <span className="chat-page__empty-hi">HI!</span>
                <span className="chat-page__empty-title">
                  I&apos;m your inbox agent.
                </span>
                <p className="chat-page__empty-description">
                  Ask me to summarize your inbox, draft a reply, archive a
                  category, or schedule a follow-up. I&apos;ll show you what I
                  find.
                </p>
              </div>
            </div>
          ) : (
            <div className="chat-page__thread" ref={threadRef}>
              <div className="chat-page__thread-inner">
                {messages.map((message, index) => {
                  const isLatest = index === messages.length - 1;
                  return message.role === "user" ? (
                    <UserMessage key={message.id} content={message.content} />
                  ) : (
                    <ChatResponse
                      key={message.id}
                      response={message.response}
                      onAction={handleAction}
                      onGrow={isLatest ? scrollToBottom : undefined}
                    />
                  );
                })}

                {thinkingStages && (
                  <ThinkingIndicator
                    stages={thinkingStages}
                    stageDuration={1100}
                    onComplete={handleThinkingComplete}
                  />
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          )}

          <div className="chat-page__composer">
            <div className="chat-page__composer-inner">
              <PromptInput
                email="example@gmail.com"
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function actionLabel(action: ResponseAction): string {
  switch (action.type) {
    case "open-email":
      return `Open email ${action.emailId}`;
    case "confirm-send":
      return "Confirm and send the draft";
    case "continue-draft":
      return "Continue editing the draft";
    case "schedule-accept":
      return "Schedule the event";
    case "schedule-cancel":
      return "Cancel the event";
    case "confirm":
      return action.choice === "yes" ? "Yes, confirm" : "No, cancel";
  }
}