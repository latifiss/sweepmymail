'use client';

import { ButtonHTMLAttributes } from "react";

type EditButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function EditButton({ className, ...props }: EditButtonProps) {
  return (
    <button
      {...props}
      className={`btn-icon btn-icon--edit ${className || ""}`.trim()}
    >
      <span className="btn-icon__text">Edit this article</span>
    </button>
  );
}
