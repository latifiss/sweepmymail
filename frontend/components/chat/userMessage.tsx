"use client";

import { useMemo } from "react";
import ReferenceChip from "../referenceChip";
import {
  REFERENCE_MAP,
  REFERENCE_MATCHABLE_SORTED,
  resolveReference,
  type ReferenceDefinition,
} from "../references";

export interface UserMessageProps {
  content: string;
  className?: string;
}

type Token =
  | { type: "text"; value: string }
  | { type: "chip"; def: ReferenceDefinition };

const BOUNDARY_REGEX = /[\s.,!?;:()[\]{}"'`]/;

function tokenize(raw: string): Token[] {
  if (!raw) return [];

  const tokens: Token[] = [];
  const pattern = new RegExp(
    `@?\\b(${REFERENCE_MATCHABLE_SORTED.join("|")})\\b`,
    "gi"
  );

  let cursor = 0;
  let match: RegExpExecArray | null;
  pattern.lastIndex = 0;

  while ((match = pattern.exec(raw)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    const nextChar = raw.charAt(end);
    const isBoundary = end === raw.length || BOUNDARY_REGEX.test(nextChar);
    if (!isBoundary) continue;

    const def = resolveReference(match[1]);
    if (!def) continue;

    if (start > cursor) {
      tokens.push({ type: "text", value: raw.slice(cursor, start) });
    }

    tokens.push({ type: "chip", def });
    cursor = end;
  }

  if (cursor < raw.length) {
    tokens.push({ type: "text", value: raw.slice(cursor) });
  }

  return tokens;
}

export default function UserMessage({
  content,
  className,
}: UserMessageProps) {
  const rootClassName = className
    ? `user-message ${className}`
    : "user-message";

  const tokens = useMemo(() => tokenize(content), [content]);

  return (
    <div className={rootClassName}>
      <div className="user-message__bubble">
        {tokens.map((token, index) =>
          token.type === "chip" ? (
            <ReferenceChip
              key={`chip-${index}`}
              icon={<token.def.Icon />}
              label={token.def.label}
              color={token.def.color}
            />
          ) : (
            <span key={`text-${index}`} className="user-message__text">
              {token.value}
            </span>
          )
        )}
      </div>
    </div>
  );
}