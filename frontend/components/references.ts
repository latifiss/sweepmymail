import type { ComponentType } from "react";
import {
  ApplyChipIcon,
  ArchiveChipIcon,
  CategorizeChipIcon,
  ComposeChipIcon,
  ConfirmChipIcon,
  CreateChipIcon,
  DeleteChipIcon,
  DraftChipIcon,
  EmailsChipIcon,
  ForwardChipIcon,
  GeneralChipIcon,
  ImportantChipIcon,
  ListChipIcon,
  PrioritizeChipIcon,
  PriorityChipIcon,
  ReplyChipIcon,
  SaveChipIcon,
  ScheduleChipIcon,
  SendChipIcon,
  SummaryChipIcon,
  UnsubscribeChipIcon,
} from "@/public/icons/svg";

export interface ReferenceDefinition {
  trigger: string;
  label: string;
  color: string;
  Icon: ComponentType<{ className?: string }>;
}

// ------------------------------------------------------------
// Reference registry
// Trigger words are matched case-insensitively. Optionally
// prefixed with `@` — the prefix is stripped before matching
// and never appears in the flattened payload.
// ------------------------------------------------------------
export const REFERENCES: ReferenceDefinition[] = [
  { trigger: "apply", label: "APPLY", color: "#70D690", Icon: ApplyChipIcon },
  { trigger: "archive", label: "ARCHIVE", color: "#5E44E9", Icon: ArchiveChipIcon },
  { trigger: "categorize", label: "CATEGORIZE", color: "#162550", Icon: CategorizeChipIcon },
  { trigger: "compose", label: "COMPOSE", color: "#FF591E", Icon: ComposeChipIcon },
  { trigger: "confirm", label: "CONFIRM", color: "#2F80ED", Icon: ConfirmChipIcon },
  { trigger: "create", label: "CREATE", color: "#70D690", Icon: CreateChipIcon },
  { trigger: "delete", label: "DELETE", color: "#FF1E47", Icon: DeleteChipIcon },
  { trigger: "draft", label: "DRAFT", color: "#FF591E", Icon: DraftChipIcon },
  { trigger: "emails", label: "EMAILS", color: "#70D690", Icon: EmailsChipIcon },
  { trigger: "forward", label: "FORWARD", color: "#5E44E9", Icon: ForwardChipIcon },
  { trigger: "general", label: "GENERAL", color: "#F2C94C", Icon: GeneralChipIcon },
  { trigger: "important", label: "IMPORTANT", color: "#FF1E47", Icon: ImportantChipIcon },
  { trigger: "list", label: "LIST", color: "#2F80ED", Icon: ListChipIcon },
  { trigger: "prioritize", label: "PRIORITIZE", color: "#5E44E9", Icon: PrioritizeChipIcon },
  { trigger: "priority", label: "PRIORITY", color: "#5E44E9", Icon: PriorityChipIcon },
  { trigger: "reply", label: "REPLY", color: "#F2C94C", Icon: ReplyChipIcon },
  { trigger: "save", label: "SAVE", color: "#70D690", Icon: SaveChipIcon },
  { trigger: "schedule", label: "SCHEDULE", color: "#2F80ED", Icon: ScheduleChipIcon },
  { trigger: "send", label: "SEND", color: "#162550", Icon: SendChipIcon },
  { trigger: "summary", label: "SUMMARY", color: "#FF591E", Icon: SummaryChipIcon },
  { trigger: "unsubscribe", label: "UNSUBSCRIBE", color: "#FF1E47", Icon: UnsubscribeChipIcon },
];

export const REFERENCE_MAP: Record<string, ReferenceDefinition> =
  REFERENCES.reduce((acc, ref) => {
    acc[ref.trigger] = ref;
    return acc;
  }, {} as Record<string, ReferenceDefinition>);

// ------------------------------------------------------------
// Aliases
// Short or alternate words that resolve to a canonical trigger.
// Used by the toolbar hints (e.g. `@email` → `emails`).
// ------------------------------------------------------------
export const REFERENCE_ALIASES: Record<string, string> = {
  email: "emails",
  cat: "categorize",
  sum: "summary",
  prior: "prioritize",
};

// Lookup order: canonical trigger first, then alias.
export function resolveReference(word: string): ReferenceDefinition | null {
  const lower = word.toLowerCase();
  const direct = REFERENCE_MAP[lower];
  if (direct) return direct;

  const alias = REFERENCE_ALIASES[lower];
  if (alias) return REFERENCE_MAP[alias];

  return null;
}

// All known matchable words: canonical triggers plus aliases.
// Sorted longest-first so `prioritize` matches before `priority`.
export const REFERENCE_MATCHABLE_SORTED: string[] = [
  ...Object.keys(REFERENCE_MAP),
  ...Object.keys(REFERENCE_ALIASES),
]
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .sort((a, b) => b.length - a.length);