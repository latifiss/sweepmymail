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
    let matchedLength = 0;

    for (const email of subjects) {
      const index = value.toLocaleLowerCase().indexOf(email.subject.toLocaleLowerCase(), cursor);
      if (index >= 0 && (nextIndex < 0 || index < nextIndex ||
        (index === nextIndex && email.subject.length > matchedLength))) {
        nextIndex = index;
        matchedEmail = email;
        matchedLength = email.subject.length;
      }
    }

    if (nextIndex < 0 || !matchedEmail) break;

    if (nextIndex > cursor) {
      nodes.push(<span key={`${keyPrefix}-text-${partIndex++}`}>{value.slice(cursor, nextIndex)}</span>);
    }

    nodes.push(
      <button
        key={`${keyPrefix}-email-${partIndex++}`}
        type="button"
        className="chat-response__email-reference"
        aria-label={`Open email: ${matchedEmail.subject}`}
        title="Open this email in Gmail"
        onClick={() => onAction?.({ type: "open-email", emailId: matchedEmail!.id })}
      >
        {value.slice(nextIndex, nextIndex + matchedLength)}
      </button>,
    );
    cursor = nextIndex + matchedLength;
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
      if (ref) {
        return (
          <button
            key={`cite-${index}`}
            type="button"
            className="chat-response__citation"
            aria-label={`Open citation ${citation[1]}: ${ref.subject}`}
            onClick={() => onAction?.({ type: "open-email", emailId: ref.id })}
          >
            {citation[1]}
          </button>
        );
      }
      return <span key={index}>{token}</span>;
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

export function ChatResponseContent({
  content,
  citations = [],
  onAction,
}: ContentProps): ReactNode {
  if (!content) return null;

  const normalized = content
    .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD\u034F]/g, "")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();

  const blocks = normalized.split(/\n\s*\n/).filter((block) => block.trim());
  return (
    <div className="chat-response__content">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const bulletLines = lines.map((line) => line.match(/^[-*•]\s+(.+)$/));
        const numberedLines = lines.map((line) => line.match(/^\d+[.)]\s+(.+)$/));

        if (bulletLines.every(Boolean)) {
          return (
            <ul className="chat-response__prose-list" key={blockIndex}>
              {bulletLines.map((match, index) => (
                <li key={index}>{renderInline(match![1], citations, onAction)}</li>
              ))}
            </ul>
          );
        }

        if (numberedLines.every(Boolean)) {
          return (
            <ol className="chat-response__prose-list" key={blockIndex}>
              {numberedLines.map((match, index) => (
                <li key={index}>{renderInline(match![1], citations, onAction)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p className="chat-response__text" key={blockIndex}>
            {renderInline(lines.map((line) => line.replace(/^#{1,6}\s+/, "")).join(" "), citations, onAction)}
          </p>
        );
      })}
    </div>
  );
}
