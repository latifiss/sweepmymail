"use client";

import type { ReactNode } from "react";
import type { EmailRef, ResponseAction } from "./chat-response-types";

interface ContentProps {
  content: string;
  citations?: EmailRef[];
  onAction?: (action: ResponseAction) => void;
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
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return <span key={index}>{token}</span>;
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
