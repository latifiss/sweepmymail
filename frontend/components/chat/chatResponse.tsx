"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { GmailIcon } from "@/public/icons/svg";
import { ChatResponseContent } from "./chat-response-content";
import { useTypewriter } from "./useTypewriter";
import type {
  EmailRef,
  ResponseAction,
  ResponseBlock,
} from "./chat-response-types";

export interface ChatResponseProps {
  response: ResponseBlock;
  onAction?: (action: ResponseAction) => void;
  stream?: boolean;
  streamSpeed?: number;
  onStreamComplete?: () => void;
  onGrow?: () => void;
  className?: string;
}

export default function ChatResponse({
  response,
  onAction,
  stream = true,
  streamSpeed = 15,
  onStreamComplete,
  onGrow,
  className,
}: ChatResponseProps): ReactNode {
  const rootClassName = className
    ? `chat-response ${className}`
    : response.kind === "text"
      ? "chat-response chat-response--plain"
      : "chat-response";

  const leadText = response.lead ?? "";
  const [blockRevealed, setBlockRevealed] = useState(!stream);

  const handleLeadComplete = useCallback(() => {
    const timer = setTimeout(() => {
      setBlockRevealed(true);
      onStreamComplete?.();
    }, 120);
    return () => clearTimeout(timer);
  }, [onStreamComplete]);

  const lead = useTypewriter(leadText, {
    speed: streamSpeed,
    enabled: stream && leadText.length > 0,
    onComplete: handleLeadComplete,
  });

  useEffect(() => {
    if (!onGrow) return;
    onGrow();
  }, [lead.visible, onGrow]);

  useEffect(() => {
    if (!onGrow) return;
    if (blockRevealed) onGrow();
  }, [blockRevealed, onGrow]);

  useEffect(() => {
    if (!lead.isTyping) return;

    const skip = () => lead.skip();
    document.addEventListener("click", skip, { once: true });
    document.addEventListener("keydown", skip, { once: true });
    return () => {
      document.removeEventListener("click", skip);
      document.removeEventListener("keydown", skip);
    };
  }, [lead]);

  const hasLead = leadText.length > 0;

  return (
    <div className={rootClassName} data-kind={response.kind}>
      {hasLead && (
        <p className="chat-response__lead">
          {lead.visible}
          {lead.isTyping && <span className="chat-response__cursor" />}
        </p>
      )}

      <div
        className={`chat-response__body${response.kind !== "text" ? " chat-response__body--container" : ""}${blockRevealed ? " chat-response__body--revealed" : ""}`}
      >
        {blockRevealed && renderBlock(response, onAction)}
      </div>
    </div>
  );
}

function renderBlock(
  response: ResponseBlock,
  onAction?: (action: ResponseAction) => void
): ReactNode {
  switch (response.kind) {
    case "text":
      return (
        <ChatResponseContent
          content={response.content}
          citations={response.citations}
          onAction={onAction}
        />
      );

    case "email-list":
      return (
        <EmailListBlock
          title={response.title}
          emails={response.emails}
          onAction={onAction}
        />
      );

    case "summary":
      return (
        <SummaryBlock
          title={response.title}
          content={response.content}
          citations={response.citations}
          onAction={onAction}
        />
      );

    case "draft":
      return <DraftBlock draft={response.draft} onAction={onAction} />;

    case "schedule":
      return <ScheduleBlock event={response.event} onAction={onAction} />;

    case "confirm":
      return (
        <ConfirmBlock
          promptId={response.promptId}
          question={response.question}
          onAction={onAction}
        />
      );
  }
}

interface EmailListBlockProps {
  title?: string;
  emails: EmailRef[];
  onAction?: (action: ResponseAction) => void;
}

function EmailListBlock({ title, emails, onAction }: EmailListBlockProps) {
  return (
    <div className="chat-response__list">
      {title && <p className="chat-response__list-title">{title}</p>}

      <ul className="chat-response__list-items">
        {emails.map((email) => (
          <li key={email.id} className="chat-response__list-item">
            <button
              type="button"
              className="chat-response__email-row"
              onClick={() =>
                onAction?.({ type: "open-email", emailId: email.id })
              }
            >
              <span className="chat-response__email-sender">
                {email.sender}
              </span>
              <span className="chat-response__email-subject">
                {email.subject}
              </span>
              <span className="chat-response__email-preview">
                {email.preview}
              </span>
              <span className="chat-response__email-time">
                {formatTime(email.receivedAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SummaryBlockProps {
  title?: string;
  content: string;
  citations: EmailRef[];
  onAction?: (action: ResponseAction) => void;
}

function SummaryBlock({
  title,
  content,
  citations,
  onAction,
}: SummaryBlockProps) {
  return (
    <div className="chat-response__summary">
      {title && <p className="chat-response__summary-title">{title}</p>}

      <ChatResponseContent
        content={content}
        citations={citations}
        onAction={onAction}
      />

      <div className="chat-response__sources">
        <p className="chat-response__sources-label">Sources</p>
        <ol className="chat-response__sources-list">
          {citations.map((ref) => (
            <li key={ref.id} className="chat-response__source">
              <button
                type="button"
                className="chat-response__source-link"
                onClick={() =>
                  onAction?.({ type: "open-email", emailId: ref.id })
                }
              >
                <span className="chat-response__source-subject">
                  {ref.subject}
                </span>
                <span className="chat-response__source-meta">
                  {ref.sender} · {formatTime(ref.receivedAt)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

interface DraftBlockProps {
  draft: import("./chat-response-types").EmailDraft;
  onAction?: (action: ResponseAction) => void;
}

function DraftBlock({ draft, onAction }: DraftBlockProps) {
  return (
    <div className="chat-response__draft">
      <header className="chat-response__draft-header">
        <GmailIcon />
        <span className="chat-response__draft-header-label">Gmail</span>
      </header>

      <div className="chat-response__draft-fields">
        <div className="chat-response__draft-row">
          <span className="chat-response__draft-label">Recipients</span>
          <span className="chat-response__draft-value">{draft.to}</span>
        </div>

        <div className="chat-response__draft-row">
          <span className="chat-response__draft-label">Subject</span>
          <span className="chat-response__draft-value">{draft.subject}</span>
        </div>
      </div>

      <div className="chat-response__draft-body">{draft.body}</div>

      <div className="chat-response__draft-actions">
        <button
          type="button"
          className="chat-response__draft-btn chat-response__draft-btn--secondary"
          onClick={() =>
            onAction?.({ type: "continue-draft", draftId: draft.id })
          }
        >
          Continue
        </button>

        <button
          type="button"
          className="chat-response__draft-btn chat-response__draft-btn--primary"
          onClick={() =>
            onAction?.({ type: "confirm-send", draftId: draft.id })
          }
        >
          Confirm and send
        </button>
      </div>
    </div>
  );
}

interface ScheduleBlockProps {
  event: import("./chat-response-types").ScheduleEvent;
  onAction?: (action: ResponseAction) => void;
}

function ScheduleBlock({ event, onAction }: ScheduleBlockProps) {
  return (
    <div className="chat-response__schedule">
      <p className="chat-response__schedule-title">{event.title}</p>
      <p className="chat-response__schedule-when">
        {event.when} · {event.duration}
      </p>

      <div className="chat-response__schedule-actions">
        <button
          type="button"
          className="chat-response__draft-btn chat-response__draft-btn--secondary"
          onClick={() =>
            onAction?.({ type: "schedule-cancel", eventId: event.id })
          }
        >
          Cancel
        </button>
        <button
          type="button"
          className="chat-response__draft-btn chat-response__draft-btn--primary"
          onClick={() =>
            onAction?.({ type: "schedule-accept", eventId: event.id })
          }
        >
          Schedule
        </button>
      </div>
    </div>
  );
}

interface ConfirmBlockProps {
  promptId: string;
  question: string;
  onAction?: (action: ResponseAction) => void;
}

function ConfirmBlock({ promptId, question, onAction }: ConfirmBlockProps) {
  return (
    <div className="chat-response__confirm">
      <p className="chat-response__confirm-question">{question}</p>

      <div className="chat-response__confirm-actions">
        <button
          type="button"
          className="chat-response__draft-btn chat-response__draft-btn--secondary"
          onClick={() =>
            onAction?.({ type: "confirm", promptId, choice: "no" })
          }
        >
          Cancel
        </button>
        <button
          type="button"
          className="chat-response__draft-btn chat-response__draft-btn--primary"
          onClick={() =>
            onAction?.({ type: "confirm", promptId, choice: "yes" })
          }
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}