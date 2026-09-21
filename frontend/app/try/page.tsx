// app/try/page.tsx
"use client";

import { useState } from "react";
import ChatResponse from "@/components/chat/chatResponse";
import UserMessage from "@/components/chat/userMessage";
import type {
  ResponseAction,
  ResponseBlock,
} from "@/components/chat/chat-response-types";

// ------------------------------------------------------------
// Fixture responses — one per block kind. Rendered in order so
// every block can be previewed without a live agent.
// ------------------------------------------------------------
const FIXTURES: ResponseBlock[] = [
  {
    kind: "text",
    lead: "Let me check your inbox.",
    content:
      "I've categorized 132 emails from this week. Three of them look time-sensitive and I've flagged them for you.",
  },
  {
    kind: "email-list",
    lead: "For the past 24 hours, 28 people sent you emails. Here are the unread ones.",
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
  },
  {
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
  },
  {
    kind: "draft",
    lead: "I've drafted a reply to Alice. Take a look:",
    draft: {
      id: "d_301",
      to: "team@acme.com",
      subject: "Standup notes — Sep 20",
      body: "Hi team,\n\nHere are today's notes:\n- Shipped the auth fix\n- Blocked on the pricing design\n- Alice will review tomorrow\n\nBest,\nJohn",
    },
  },
  {
    kind: "schedule",
    lead: "Here's a time that works for you and Alice.",
    event: {
      id: "s_401",
      title: "Follow-up with Alice",
      when: "Tomorrow, 2:00 PM",
      duration: "30 minutes",
    },
  },
  {
    kind: "confirm",
    lead: "I can archive all 42 promotions emails. Want me to?",
    promptId: "p_501",
    question: "Archive all 42 emails from the promotions category?",
  },
];

// ------------------------------------------------------------
// User fixtures — each entry pairs a submitted user prompt with
// the response that follows it. Renders as a conversation thread
// so the pairing is visible.
// ------------------------------------------------------------
const USER_FIXTURES: string[] = [
  "@email my list please @create a draft",
  "Give me a summary of the past 24 hours",
  "Draft a reply to Alice about the Q3 planning doc",
];

export default function TryPage() {
  const [log, setLog] = useState<string[]>([]);

  const handleAction = (action: ResponseAction) => {
    setLog((prev) => [
      `${new Date().toLocaleTimeString()} — ${JSON.stringify(action)}`,
      ...prev,
    ]);
  };

  return (
    <div className="try-page">
      <header className="try-page__header">
        <h1 className="try-page__title">Chat response preview</h1>
        <p className="try-page__lead">
          Every response kind rendered from a fixture. Actions log below.
        </p>
      </header>

      <div className="try-page__layout">
        <div className="try-page__responses">
          {FIXTURES.map((response, index) => (
            <section
              key={index}
              className="try-page__section"
              aria-label={`Fixture ${index + 1}: ${response.kind}`}
            >
              <span className="try-page__kind-label">{response.kind}</span>

              {USER_FIXTURES[index] && (
                <UserMessage content={USER_FIXTURES[index]} />
              )}

              <ChatResponse response={response} onAction={handleAction} />
            </section>
          ))}
        </div>

        <aside className="try-page__log" aria-label="Action log">
          <header className="try-page__log-header">
            <span className="try-page__log-title">Action log</span>
            {log.length > 0 && (
              <button
                type="button"
                className="try-page__log-clear"
                onClick={() => setLog([])}
              >
                Clear
              </button>
            )}
          </header>

          {log.length === 0 ? (
            <p className="try-page__log-empty">
              No actions yet. Click a citation, an email row, a draft button,
              or a schedule / confirm button.
            </p>
          ) : (
            <ul className="try-page__log-list">
              {log.map((entry, index) => (
                <li key={index} className="try-page__log-item">
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}