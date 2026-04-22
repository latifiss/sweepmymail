'use client';

import { TextareaHTMLAttributes, useRef, useEffect } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  placeholder?: string;
};

export function Textarea({ className, ...props }: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    handleInput(); 
    textarea.addEventListener('input', handleInput);

    return () => textarea.removeEventListener('input', handleInput);
  }, []);

  return (
    <div className="form__textarea-wrapper">
      <textarea
        {...props}
        ref={textareaRef}
        className={`form__textarea ${className || ""}`.trim()}
        style={{ minHeight: '40px' }}
        rows={1}
      />
    </div>
  );
}
