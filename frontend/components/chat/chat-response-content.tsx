"use client";

import type { ReactNode } from "react";
import type { EmailRef, ResponseAction } from "./chat-response-types";

interface ContentProps {
  content: string;
  citations?: EmailRef[];
  onAction?: (action: ResponseAction) => void;
}

export function ChatResponseContent({
  content,
  citations = [],
  onAction,
}: ContentProps): ReactNode {
  if (!content) return null;

  // Keep the chat typography consistent: model Markdown must never leak
  // through as literal asterisks, headings, or list markers.
  const cleanContent = content
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,!?]|$)/g, "$1$2")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .trim();

  const parts = cleanContent.split(/(\[\d+\])/g);

  return (
    <p className="chat-response__text">
      {parts.map((part, index) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const refIndex = Number(match[1]) - 1;
          const ref = citations[refIndex];
          if (ref) {
            return (
              <button
                key={`cite-${index}`}
                type="button"
                className="chat-response__citation"
                aria-label={`Open citation ${match[1]}: ${ref.subject}`}
                onClick={() =>
                  onAction?.({ type: "open-email", emailId: ref.id })
                }
              >
                {match[1]}
              </button>
            );
          }
        }
        return <span key={`txt-${index}`}>{part}</span>;
      })}
    </p>
  );
}