"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface ThinkingIndicatorProps {
  stages?: string[];
  stageDuration?: number;
  finishDelay?: number;
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_STAGES = [
  "Finding emails",
  "Reading emails",
  "Categorizing",
  "Summarizing",
  "Preparing response",
];

export default function ThinkingIndicator({
  stages = DEFAULT_STAGES,
  stageDuration = 1500,
  finishDelay = 0,
  onComplete,
  className,
}: ThinkingIndicatorProps): ReactNode {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= stages.length - 1) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, stageDuration + finishDelay);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setStageIndex((i) => i + 1);
    }, stageDuration);

    return () => clearTimeout(timer);
  }, [stageIndex, stages.length, stageDuration, finishDelay, onComplete]);

  const currentStage = stages[stageIndex];

  return (
    <div
      className={`thinking-indicator${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="thinking-indicator__bars" aria-hidden="true">
        <span className="thinking-indicator__bar thinking-indicator__bar--one" />
        <span className="thinking-indicator__bar thinking-indicator__bar--two" />
        <span className="thinking-indicator__bar thinking-indicator__bar--three" />
      </span>

      <span className="thinking-indicator__label">
        {currentStage}
        <span className="thinking-indicator__dots" aria-hidden="true">
          <span className="thinking-indicator__dot">.</span>
          <span className="thinking-indicator__dot">.</span>
          <span className="thinking-indicator__dot">.</span>
        </span>
      </span>
    </div>
  );
}