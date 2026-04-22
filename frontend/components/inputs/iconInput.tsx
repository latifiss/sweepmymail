'use client';

import { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  placeholder?: string;
};

export function IconInput({ icon: Icon, className, ...props }: TextInputProps) {
  return (
    <div className="form__icon-input-wrapper">
      {Icon && <Icon className="form__icon-input-wrapper__icon" />}
      <input
        {...props}
        className={`form__input ${className || ""}`.trim()}
      />
    </div>
  );
}
