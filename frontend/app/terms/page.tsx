'use client'

import React, { useMemo } from 'react'

export default function TermsPage() {
  const lastUpdated = useMemo(() => 'April 2026', [])

  return (
    <main className="terms-page">
      <div className="terms-page__container">

        {/* HEADER */}
        <header className="terms-header">
          <h1 className="terms-header__title">Terms of Service</h1>
          <p className="terms-header__subtitle">
            Please read these terms carefully before using Magic Mail.
          </p>
          <span className="terms-header__date">Last updated: {lastUpdated}</span>
        </header>

        {/* CONTENT */}
        <section className="terms-content">

          <div className="terms-section">
            <h2 className="terms-section__title">1. Acceptance of Terms</h2>
            <p className="terms-section__text">
              By accessing or using Magic Mail (“Service”), you agree to be bound by these Terms.
              If you do not agree, you may not use the Service.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">2. Description of Service</h2>
            <p className="terms-section__text">
              Magic Mail is an email management platform that helps users organize, categorize,
              and manage emails more efficiently using automation tools and AI-assisted features.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">3. User Accounts</h2>
            <p className="terms-section__text">
              You are responsible for maintaining the confidentiality of your account credentials.
              Any activity under your account is your responsibility.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">4. Acceptable Use</h2>
            <ul className="terms-section__list">
              <li>You must not misuse the Service or interfere with its normal operation.</li>
              <li>You must not attempt to gain unauthorized access to systems or data.</li>
              <li>You must not use Magic Mail for illegal or harmful activities.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">5. Subscription & Billing</h2>
            <p className="terms-section__text">
              Some features may require a paid subscription. By subscribing, you agree to the pricing,
              billing cycle, and payment terms shown at checkout.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">6. Data & Privacy</h2>
            <p className="terms-section__text">
              We value your privacy. Please refer to our Privacy Policy for details on how we collect
              and use your data.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">7. Service Availability</h2>
            <p className="terms-section__text">
              We strive to keep Magic Mail running smoothly, but we do not guarantee uninterrupted access.
              Maintenance and updates may temporarily affect availability.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">8. Termination</h2>
            <p className="terms-section__text">
              We reserve the right to suspend or terminate accounts that violate these Terms or misuse the Service.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">9. Changes to Terms</h2>
            <p className="terms-section__text">
              We may update these Terms from time to time. Continued use of Magic Mail means you accept any updates.
            </p>
          </div>

          <div className="terms-section">
            <h2 className="terms-section__title">10. Contact</h2>
            <p className="terms-section__text">
              If you have questions about these Terms, contact us at:
              <br />
              <span className="terms-section__highlight">support@magicmail.com</span>
            </p>
          </div>

        </section>
      </div>
    </main>
  )
}