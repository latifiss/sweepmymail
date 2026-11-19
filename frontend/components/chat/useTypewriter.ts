"use client";

import { useEffect, useRef, useState } from "react";

interface UseTypewriterOptions {
  speed?: number;
  enabled?: boolean;
  onComplete?: () => void;
}

interface UseTypewriterResult {
  visible: string;
  isTyping: boolean;
  skip: () => void;
}

export function useTypewriter(
  text: string,
  { speed = 15, enabled = true, onComplete }: UseTypewriterOptions = {}
): UseTypewriterResult {
  const [visibleLength, setVisibleLength] = useState(
    enabled ? 0 : text.length
  );
  const [isTyping, setIsTyping] = useState(false);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    completedRef.current = false;

    if (!enabled) {
      setVisibleLength(text.length);
      setIsTyping(false);
      completedRef.current = true;
      onCompleteRef.current?.();
      return;
    }

    setVisibleLength(0);
    setIsTyping(text.length > 0);
  }, [text, enabled]);

  useEffect(() => {
    if (!enabled) return;

    if (visibleLength >= text.length) {
      if (isTyping) {
        setIsTyping(false);
      }
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setVisibleLength((n) => Math.min(n + 1, text.length));
    }, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visibleLength, text.length, speed, enabled, isTyping]);

  const skip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisibleLength(text.length);
    setIsTyping(false);
    if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  };

  return {
    visible: text.slice(0, visibleLength),
    isTyping,
    skip,
  };
}