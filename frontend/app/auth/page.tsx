import type { ReactNode } from 'react';
import Image from 'next/image';
import GoogleButton from '@/components/buttons/googleButton';

export default function AuthPage(): ReactNode {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <Image
            src="/logos/logo.png"
            alt="MagicMail"
            width={86}
            height={86}
            priority
          />
        </div>

        <div className="auth-card__heading">
          <h1 className="auth-card__title">Login or Signup</h1>
        </div>

        <div className="auth-card__body">
          <p className="auth-card__lead">
            Use your Google account to sign in or create one automatically.
          </p>
        </div>

        <div className="auth-card__action">
          <GoogleButton />
        </div>

        <div className="auth-card__legal">
          <p className="auth-card__legal-text">
            By continuing, you agree to our{' '}
            <a href="/terms" className="auth-card__legal-link">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="auth-card__legal-link">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="auth-card__footnote">
          <p className="auth-card__footnote-text">
            No credit card required • Try for free
          </p>
        </div>
      </div>
    </main>
  );
}