"use client";

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type BaseButtonVariant = 'default' | 'alternate';

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BaseButtonVariant;
  children: ReactNode;
}

export default function BaseButton({
  variant = 'default',
  className,
  children,
  type = 'button',
  ...rest
}: BaseButtonProps) {
  const rootClassName = [
    'base-button',
    `base-button--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={rootClassName} {...rest}>
      {children}
    </button>
  );
}