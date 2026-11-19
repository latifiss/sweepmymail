"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import { GoogleIcon } from "@/public/icons/svg/index";

export interface GoogleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label?: string;
}

const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7000";

export default function GoogleButton({
  label = "Continue with Google",
  className,
  type = "button",
  disabled,
  ...rest
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootClassName = className
    ? `google-button ${className}`
    : "google-button";

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;

    setLoading(true);
    setError(null);

    try {
      const callbackURL = `${window.location.origin}/login/callback`;
      const response = await fetch(
        `${backendBaseUrl}/api/auth/sign-in/social`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "google",
            callbackURL,
            errorCallbackURL: callbackURL,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.url) {
        throw new Error(
          data?.message || data?.error || "Unable to start Google sign-in.",
        );
      }

      window.location.assign(data.url);
    } catch (err) {
      console.error("Google sign-in could not be started:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start Google sign-in. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="google-button__wrapper">
      <button
        type={type}
        className={rootClassName}
        onClick={handleGoogleSignIn}
        disabled={disabled || loading}
        aria-busy={loading}
        {...rest}
      >
        <GoogleIcon size={16} />
        <span className="google-button__label">
          {loading ? "Redirecting to Google..." : label}
        </span>
      </button>
      {error && (
        <p className="google-button__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
