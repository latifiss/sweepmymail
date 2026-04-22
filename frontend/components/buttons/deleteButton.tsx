'use client';

import { ButtonHTMLAttributes } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";

type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DeleteButton({ className, ...props }: DeleteButtonProps) {
  return (
    <button
      {...props}
      className={`btn-icon btn-icon--delete ${className || ""}`.trim()}
    >
      <TrashIcon className="btn-icon__icon" />
      <span className="btn-icon__text">Delete</span>
    </button>
  );
}
