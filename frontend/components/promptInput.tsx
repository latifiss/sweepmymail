"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import {
  EmailsIcon,
  CategorizeIcon,
  SummaryIcon,
  PrioritizeIcon,
  RightIcon,
  LeftIcon,
  UpIcon,
  GmailIcon,
} from "@/public/icons/svg";
import ReferenceChip from "./referenceChip";
import {
  REFERENCE_MAP,
  REFERENCE_MATCHABLE_SORTED,
  resolveReference,
  type ReferenceDefinition,
} from "./references";

export interface PromptInputProps {
  email?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  className?: string;
}

type Token =
  | { type: "text"; value: string }
  | { type: "chip"; def: ReferenceDefinition; raw: string };

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

    tokens.push({ type: "chip", def, raw: raw.slice(start, end) });
    cursor = end;
  }

  if (cursor < raw.length) {
    tokens.push({ type: "text", value: raw.slice(cursor) });
  }

  return tokens;
}

function flatten(tokens: Token[]): string {
  return tokens
    .map((t) => (t.type === "text" ? t.value : t.def.trigger))
    .join("");
}

export default function PromptInput({
  email = "example@gmail.com",
  onSubmit,
  onChange,
  className,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const [caretPosition, setCaretPosition] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const caretMeasureRef = useRef<HTMLSpanElement>(null);
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0, height: 18 });

  const hasValue = value.trim().length > 0;
  const tokens = useMemo(() => tokenize(value), [value]);
  const showPlaceholder = value.length === 0;

  const autoResize = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = "auto";
    const next = Math.min(input.scrollHeight, 200);
    input.style.height = `${next}px`;

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.minHeight = `${next}px`;
    }
  }, []);

  useLayoutEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const syncCaretPosition = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    setCaretPosition(input.selectionStart ?? 0);
  }, []);

  useEffect(() => {
    syncCaretPosition();
  }, [value, syncCaretPosition]);

  useLayoutEffect(() => {
    const measure = caretMeasureRef.current;
    const overlay = overlayRef.current;
    if (!measure || !overlay) return;

    const run = () => {
      const overlayRect = overlay.getBoundingClientRect();
      const markerRect = measure.getBoundingClientRect();

      setCaretPos({
        left: markerRect.left - overlayRect.left,
        top: markerRect.top - overlayRect.top,
        height: markerRect.height || 24,
      });
    };

    run();
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [caretPosition, value, tokens, isFocused]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);
    onChange?.(flatten(tokenize(next)));
    requestAnimationFrame(syncCaretPosition);
  };

  const handleSelect = (_e: SyntheticEvent<HTMLTextAreaElement>) => {
    syncCaretPosition();
  };

  const handleSubmit = () => {
    if (!hasValue) return;
    const payload = flatten(tokens);
    onSubmit?.(payload);
    setValue("");
    setCaretPosition(0);
    onChange?.("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const insertReference = (def: ReferenceDefinition) => {
    const input = inputRef.current;
    if (!input) return;

    const selectionStart = input.selectionStart ?? value.length;
    const selectionEnd = input.selectionEnd ?? value.length;

    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);

    const needsLeadingSpace =
      before.length > 0 && !/\s$/.test(before);
    const insertion = `${needsLeadingSpace ? " " : ""}@${def.trigger} `;

    const nextValue = before + insertion + after;
    const nextCaret = (before + insertion).length;

    setValue(nextValue);
    onChange?.(flatten(tokenize(nextValue)));

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(nextCaret, nextCaret);
      setCaretPosition(nextCaret);
    });
  };

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const renderOverlay = () => {
    const nodes: React.ReactNode[] = [];
    let charIndex = 0;
    let caretPlaced = false;

    tokens.forEach((token, index) => {
      if (token.type === "chip") {
        if (!caretPlaced && caretPosition === charIndex) {
          nodes.push(
            <span
              key={`caret-${index}`}
              ref={caretMeasureRef}
              className="prompt-input__caret-marker"
            />
          );
          caretPlaced = true;
        }

        nodes.push(
          <ReferenceChip
            key={`chip-${index}`}
            icon={<token.def.Icon />}
            label={token.def.label}
            color={token.def.color}
          />
        );

        charIndex += token.raw.length;
        return;
      }

      const chars = token.value.split("");
      chars.forEach((ch, charOffset) => {
        if (!caretPlaced && caretPosition === charIndex) {
          nodes.push(
            <span
              key={`caret-${index}-${charOffset}`}
              ref={caretMeasureRef}
              className="prompt-input__caret-marker"
            />
          );
          caretPlaced = true;
        }

        if (ch === " ") {
          nodes.push(
            <span
              key={`ch-${index}-${charOffset}`}
              className="prompt-input__text-char"
            >
              {"\u00A0"}
            </span>
          );
        } else if (ch === "\n") {
          nodes.push(
            <br key={`br-${index}-${charOffset}`} />
          );
        } else {
          nodes.push(
            <span
              key={`ch-${index}-${charOffset}`}
              className="prompt-input__text-char"
            >
              {ch}
            </span>
          );
        }

        charIndex += 1;
      });
    });

    if (!caretPlaced) {
      nodes.push(
        <span
          key="caret-end"
          ref={caretMeasureRef}
          className="prompt-input__caret-marker"
        />
      );
    }

    return nodes;
  };

  return (
    <div className={`prompt-input${className ? ` ${className}` : ""}`}>
      <div className="prompt-input__toolbar">
        {canScrollLeft && (
          <button
            type="button"
            className="prompt-input__arrow prompt-input__arrow--left"
            aria-label="Scroll left"
            onClick={() => scrollBy("left")}
          >
            <LeftIcon />
          </button>
        )}

        <div className="prompt-input__scroller" ref={scrollerRef}>
          <button
            type="button"
            className="prompt-input__chip"
            onClick={() => insertReference(REFERENCE_MAP.emails)}
          >
            <EmailsIcon />
            <span className="prompt-input__chip-text">
              <span className="prompt-input__chip-hint">
                Tap this option or type @email for inbox actions
              </span>
            </span>
          </button>

          <button
            type="button"
            className="prompt-input__chip"
            onClick={() => insertReference(REFERENCE_MAP.categorize)}
          >
            <CategorizeIcon />
            <span className="prompt-input__chip-text">
              <span className="prompt-input__chip-hint">
                Tap this option or type @cat for inbox actions
              </span>
            </span>
          </button>

          <button
            type="button"
            className="prompt-input__chip"
            onClick={() => insertReference(REFERENCE_MAP.summary)}
          >
            <SummaryIcon />
            <span className="prompt-input__chip-text">
              <span className="prompt-input__chip-hint">
                Tap this option or type @sum for inbox actions
              </span>
            </span>
          </button>

          <button
            type="button"
            className="prompt-input__chip"
            onClick={() => insertReference(REFERENCE_MAP.prioritize)}
          >
            <PrioritizeIcon />
            <span className="prompt-input__chip-text">
              <span className="prompt-input__chip-hint">
                Tap this option or type @prior for inbox actions
              </span>
            </span>
          </button>
        </div>

        {canScrollRight && (
          <button
            type="button"
            className="prompt-input__arrow prompt-input__arrow--right"
            aria-label="Scroll right"
            onClick={() => scrollBy("right")}
          >
            <RightIcon />
          </button>
        )}
      </div>

      <div className="prompt-input__composer">
        <div className="prompt-input__field-wrapper" onClick={focusInput}>
          <div ref={overlayRef} className="prompt-input__overlay" aria-hidden="true">
            {renderOverlay()}

            {isFocused && (
              <span
                className="prompt-input__caret"
                style={{
                  transform: `translate(${caretPos.left}px, ${caretPos.top}px)`,
                  height: caretPos.height,
                }}
              />
            )}
          </div>

          <textarea
            ref={inputRef}
            className="prompt-input__field"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onClick={handleSelect}
            onKeyUp={handleSelect}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            aria-label="Prompt"
          />

          {showPlaceholder && (
            <span className="prompt-input__placeholder">
              Type what you want to do here
            </span>
          )}
        </div>

        <div className="prompt-input__footer">
          <button type="button" className="prompt-input__account">
            <GmailIcon />
            <span className="prompt-input__account-email">{email}</span>
          </button>

          <button
            type="button"
            className="prompt-input__submit"
            onClick={handleSubmit}
            disabled={!hasValue}
            aria-label="Submit"
          >
            <UpIcon />
          </button>
        </div>
      </div>
    </div>
  );
}