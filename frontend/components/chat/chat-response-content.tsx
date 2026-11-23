"use client";

import type { ReactNode } from "react";
import type { EmailRef, ResponseAction } from "./chat-response-types";

interface ContentProps {
  content: string;
  citations?: EmailRef[];
  onAction?: (action: ResponseAction) => void;
}

function renderSubjectReferences(
  value: string,
  citations: EmailRef[],
  onAction?: (action: ResponseAction) => void,
  keyPrefix = "subject",
): ReactNode[] {
  const subjects = Array.from(
    new Map(
      citations
        .filter((email) => email.subject.trim().length >= 5)
        .map((email) => [email.subject.trim(), email]),
    ).values(),
  ).sort((a, b) => b.subject.length - a.subject.length);

  if (!subjects.length) return [<span key={keyPrefix}>{value}</span>];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let partIndex = 0;

  while (cursor < value.length) {
    let nextIndex = -1;
    let matchedEmail: EmailRef | undefined;

    for (const email of subjects) {
      const index = value.toLocaleLowerCase().indexOf(email.subject.toLocaleLowerCase(), cursor);
      if (index >= 0 && (nextIndex < 0 || index < nextIndex ||
        (index === nextIndex && email.subject.length > (matchedEmail?.subject.length ?? 0)))) {
        nextIndex = index;
        matchedEmail = email;
      }
    }

    if (nextIndex < 0 || !matchedEmail) break;

    if (nextIndex > cursor) {
      nodes.push(<span key={`${keyPrefix}-text-${partIndex++}`}>{value.slice(cursor, nextIndex)}</span>);
    }

    const subject = matchedEmail.subject;
    nodes.push(
      <button
        key={`${keyPrefix}-email-${partIndex++}`}
        type="button"
        className="chat-response__email-reference"
        aria-label={`Open email: ${subject}`}
        title="Open this email in Gmail"
        onClick={() => onAction?.({ type: "open-email", emailId: matchedEmail!.id })}
      >
        {value.slice(nextIndex, nextIndex + subject.length)}
      </button>,
    );
    cursor = nextIndex + subject.length;
  }

  if (!partIndex) return [<span key={keyPrefix}>{value}</span>];
  if (cursor < value.length) {
    nodes.push(<span key={`${keyPrefix}-tail`}>{value.slice(cursor)}</span>);
  }
  return nodes;
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
      return ref ? (
        <button
          key={`cite-${index}`}
          type="button"
          className="chat-response__citation"
          aria-label={`Open citation ${citation[1]}: ${ref.subject}`}
          onClick={() => onAction?.({ type: "open-email", emailId: ref.id })}
        >
          {citation[1]}
        </button>
      ) : <span key={index}>{token}</span>;
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

  return (
    <p className="chat-response__text" key={key}>
      {renderInline(text.replace(/^#{1,6}\s+/, ""), citations, onAction)}
    </p>
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
  const fallbackEmailLinks = citations.filter((email, index) => {
    const subjectMentioned = email.subject.trim().length >= 5 &&
      normalized.toLocaleLowerCase().includes(email.subject.trim().toLocaleLowerCase());
    const citationMentioned = normalized.includes(`[${index + 1}]`);
    return !subjectMentioned && !citationMentioned;
  });

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
                <li key={index}>{renderInline(item.text, citations, onAction)}</li>
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
                    <li>{renderInline(item.text, citations, onAction)}</li>
                  </ul>
                );
              }
              return renderParagraph(item.text, index, citations, onAction);
            })}
          </div>
        );
      })}
      {fallbackEmailLinks.length > 0 && (
        <div className="chat-response__email-links" aria-label="Related emails">
          {fallbackEmailLinks.map((email) => (
            <button
              key={email.id}
              type="button"
              className="chat-response__email-reference"
              aria-label={`Open email: ${email.subject}`}
              title="Open this email in Gmail"
              onClick={() => onAction?.({ type: "open-email", emailId: email.id })}
            >
              Open email: {email.subject}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
