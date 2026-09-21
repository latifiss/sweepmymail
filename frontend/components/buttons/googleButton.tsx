"use client";

import type { ButtonHTMLAttributes } from 'react';
import {GoogleIcon} from '@/public/icons/svg/index';

export interface GoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export default function GoogleButton({
  label = 'Continue with Google',
  className,
  type = 'button',
  ...rest
}: GoogleButtonProps) {
  const rootClassName = className
    ? `google-button ${className}`
    : 'google-button';

  return (
    <button type={type} className={rootClassName} {...rest}>
      <GoogleIcon size={16} />
      <span className="google-button__label">{label}</span>
    </button>
  );
}