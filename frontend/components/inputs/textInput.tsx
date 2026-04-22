'use client';

import { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  placeholder?: string;
};

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <div className="form__input-wrapper">
      <input
        {...props}
        className={`form__input ${className || ""}`.trim()}
      />
    </div>
  );
}
