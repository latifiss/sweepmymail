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

  const parts = content.split(/(\[\d+\])/g);

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