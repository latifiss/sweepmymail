"use client";

import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    outline: "btn btn-outline",
    ghost: "btn btn-ghost",
  };

  const sizeClasses = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${loading ? "opacity-50 pointer-events-none" : ""} ${className || ""}`.trim()}
      style={{ fontFamily: 'Gliker, Gotham, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
