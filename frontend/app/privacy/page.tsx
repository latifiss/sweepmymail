'use client'

import React, { useMemo } from 'react'

export default function PrivacyPage() {
  const lastUpdated = useMemo(() => 'April 2026', [])

  return (
    <main className="privacy-page">
      <div className="privacy-page__container">

        <header className="privacy-header">
          <h1 className="privacy-header__title">Privacy Policy</h1>
          <p className="privacy-header__subtitle">
            How Magic Mail collects, uses, and protects your data.
          </p>
          <span className="privacy-header__date">
            Last updated: {lastUpdated}
          </span>
        </header>

        <section className="privacy-content">

          <div className="privacy-section">
            <h2 className="privacy-section__title">1. Overview</h2>
            <p className="privacy-section__text">
              Magic Mail respects your privacy and is committed to protecting your personal data.
              This policy explains what we collect and how we use it.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">2. Information We Collect</h2>
            <p className="privacy-section__text">
              We may collect the following types of information:
            </p>
            <ul className="privacy-section__list">
              <li>Email account data (used to organize and categorize emails)</li>
              <li>Account information (name, email address, authentication data)</li>
              <li>Usage data (how you interact with the platform)</li>
              <li>Device and browser information</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">3. How We Use Your Data</h2>
            <p className="privacy-section__text">
              We use your information to:
            </p>
            <ul className="privacy-section__list">
              <li>Provide and maintain the Magic Mail service</li>
              <li>Improve performance and user experience</li>
              <li>Enable email categorization and automation features</li>
              <li>Ensure security and prevent abuse</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">4. Data Storage & Security</h2>
            <p className="privacy-section__text">
              We use industry-standard security measures, including encryption and secure servers,
              to protect your data from unauthorized access.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">5. Data Sharing</h2>
            <p className="privacy-section__text">
              We do not sell your personal data. We may share data only with trusted third-party services
              necessary for running Magic Mail (e.g., authentication, analytics, hosting).
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">6. Your Rights</h2>
            <p className="privacy-section__text">
              You have the right to:
            </p>
            <ul className="privacy-section__list">
              <li>Access your personal data</li>
              <li>Request corrections or deletion</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">7. Cookies & Tracking</h2>
            <p className="privacy-section__text">
              We use cookies to improve your experience. Please refer to our Cookies Policy for more details.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">8. Data Retention</h2>
            <p className="privacy-section__text">
              We retain your data only as long as necessary to provide our services or comply with legal obligations.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">9. Changes to This Policy</h2>
            <p className="privacy-section__text">
              We may update this Privacy Policy occasionally. Changes will be posted on this page.
            </p>
          </div>

          <div className="privacy-section">
            <h2 className="privacy-section__title">10. Contact</h2>
            <p className="privacy-section__text">
              If you have questions about this Privacy Policy, contact us at:
              <br />
              <span className="privacy-section__highlight">
                support@magicmail.com
              </span>
            </p>
          </div>

        </section>
      </div>
    </main>
  )
}