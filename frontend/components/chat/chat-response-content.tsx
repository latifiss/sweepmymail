"use client";

import type { ReactNode } from "react";
import type { EmailRef, ResponseAction } from "./chat-response-types";

interface ContentProps {
  content: string;
  citations?: EmailRef[];
  onAction?: (action: ResponseAction) => void;
}

function renderSubjectReferences(value: string, _citations: EmailRef[], _onAction?: (action: ResponseAction) => void, keyPrefix = "subject"): ReactNode[] {
  return [<span key={keyPrefix}>{value}</span>];
}

function citedEmails(value: string, citations: EmailRef[]) {
  return citations.filter((email, index) =>
    (email.subject.trim().length >= 5 && value.toLowerCase().includes(email.subject.trim().toLowerCase())) ||
    value.includes(`[${index + 1}]`),
  );
}

function EmailCitationChips({ emails, onAction }: { emails: EmailRef[]; onAction?: (action: ResponseAction) => void }) {
  if (!emails.length) return null;
  return (
    <div className="chat-response__citation-chips" aria-label="Referenced emails">
      {emails.map((email) => {
        const initials = email.sender.replace(/<[^>]+>/g, "").trim().split(/\\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
        return (
          <button key={email.id} type="button" className="chat-response__citation-chip"
            aria-label={`Open email from ${email.sender}: ${email.subject}`} title={email.subject}
            onClick={() => onAction?.({ type: "open-email", emailId: email.id })}>
            {email.senderAvatarUrl
              ? <img className="chat-response__citation-avatar" src={email.senderAvatarUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
              : <span className="chat-response__citation-avatar chat-response__citation-avatar--fallback" aria-hidden="true">{initials}</span>}
            <span className="chat-response__citation-name">{email.sender.replace(/<[^>]+>/g, "").trim() || email.senderEmail || "Email"}</span>
          </button>
        );
      })}
    </div>
  );
}

function renderInline(
  value: string,
  citations: EmailRef[],
  onAction?: (action: ResponseAction) => void,
): ReactNode[] {
  const tokens = value.split(/(\[\d+\]|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return tokens.map((token, index) => {
    const citation = token.match(/^\[(\d+)\]$/);
    if (citation) {
      const ref = citations[Number(citation[1]) - 1];
      return ref ? <span key={`cite-${index}`} className="chat-response__citation-marker" aria-hidden="true" /> : null;
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{renderSubjectReferences(token.slice(2, -2), citations, onAction, `bold-${index}`)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{renderSubjectReferences(token.slice(1, -1), citations, onAction, `italic-${index}`)}</em>;
    }
    return renderSubjectReferences(token, citations, onAction, `inline-${index}`);
  });
}

function renderParagraph(
  text: string,
  key: string | number,
  citations: EmailRef[],
  onAction?: (action: ResponseAction) => void,
): ReactNode {
  const heading = text.match(/^#{1,3}\s+(.+)$/) ||
    text.match(/^\*\*(.{2,70})\*\*\s*$/);
  if (heading) {
    return (
      <h4 className="chat-response__section-heading" key={key}>
        {renderInline(heading[1].replace(/\*\*/g, ""), citations, onAction)}
      </h4>
    );
  }

  const cleanText = text.replace(/^#{1,6}\s+/, "");
  return (
    <div className="chat-response__email-paragraph" key={key}>
      <p className="chat-response__text">{renderInline(cleanText, citations, onAction)}</p>
      <EmailCitationChips emails={citedEmails(cleanText, citations)} onAction={onAction} />
    </div>
  );
}

export function ChatResponseContent({
  content,
  citations = [],
  onAction,
}: ContentProps): ReactNode {
  if (!content) return null;

  let normalized = content
    .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD\u034F]/g, "")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();

  // Some model responses put several dash-separated items on one line.
  // Split only when the next phrase looks like a titled email/topic item.
  normalized = normalized
    .replace(/(\*\*[^*\n]{2,70}:)\s+-\s+/g, "$1**\n- ")
    .replace(/\s+-\s+(?=[A-Z][^.!?\n]{0,100}(?:—|–|:))/g, "\n- ");

  const blocks = normalized.split(/\n\s*\n/).filter((block) => block.trim());

  return (
    <div className="chat-response__content">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const items = lines.flatMap((line) => {
          const bulletParts = line.match(/^[-*•]\s+(.+)$/);
          if (bulletParts) return [{ type: "bullet" as const, text: bulletParts[1] }];
          const numbered = line.match(/^\d+[.)]\s+(.+)$/);
          if (numbered) return [{ type: "numbered" as const, text: numbered[1] }];
          return [{ type: "text" as const, text: line }];
        });

        const allBullets = items.length > 0 && items.every((item) => item.type === "bullet");
        const allNumbered = items.length > 0 && items.every((item) => item.type === "numbered");

        if (allBullets || allNumbered) {
          const List = allNumbered ? "ol" : "ul";
          return (
            <List className="chat-response__prose-list" key={blockIndex}>
              {items.map((item, index) => (
                <li key={index}>{renderInline(item.text, citations, onAction)}<EmailCitationChips emails={citedEmails(item.text, citations)} onAction={onAction} /></li>
              ))}
            </List>
          );
        }

        return (
          <div className="chat-response__prose-block" key={blockIndex}>
            {items.map((item, index) => {
              if (item.type === "bullet" || item.type === "numbered") {
                return (
                  <ul className="chat-response__prose-list chat-response__prose-list--mixed" key={index}>
                    <li>{renderInline(item.text, citations, onAction)}<EmailCitationChips emails={citedEmails(item.text, citations)} onAction={onAction} /></li>
                  </ul>
                );
              }
              return renderParagraph(item.text, index, citations, onAction);
            })}
          </div>
        );
      })}
    </div>
  );
}
