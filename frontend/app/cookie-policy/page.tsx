'use client'

import React, { useMemo } from 'react'

export default function CookiesPolicyPage() {
  const lastUpdated = useMemo(() => 'April 2026', [])

  return (
    <main className="cookies-page">
      <div className="cookies-page__container">

        {/* HEADER */}
        <header className="cookies-header">
          <h1 className="cookies-header__title">Cookies Policy</h1>
          <p className="cookies-header__subtitle">
            How Magic Mail uses cookies to improve your experience.
          </p>
          <span className="cookies-header__date">
            Last updated: {lastUpdated}
          </span>
        </header>

        {/* CONTENT */}
        <section className="cookies-content">

          <div className="cookies-section">
            <h2 className="cookies-section__title">1. What are cookies?</h2>
            <p className="cookies-section__text">
              Cookies are small text files stored on your device when you visit a website.
              They help websites remember your preferences and improve your experience.
            </p>
          </div>

          <div className="cookies-section">
            <h2 className="cookies-section__title">2. How Magic Mail uses cookies</h2>
            <p className="cookies-section__text">
              We use cookies to:
            </p>
            <ul className="cookies-section__list">
              <li>Keep you signed in</li>
              <li>Remember your preferences</li>
              <li>Improve performance and stability</li>
              <li>Understand how users interact with the platform</li>
            </ul>
          </div>

          <div className="cookies-section">
            <h2 className="cookies-section__title">3. Types of cookies we use</h2>

            <div className="cookies-type">
              <h3 className="cookies-type__title">Essential Cookies</h3>
              <p className="cookies-type__text">
                Required for the platform to function properly (login, security, session handling).
              </p>
            </div>

            <div className="cookies-type">
              <h3 className="cookies-type__title">Performance Cookies</h3>
              <p className="cookies-type__text">
                Help us understand how users interact with Magic Mail so we can improve it.
              </p>
            </div>

            <div className="cookies-type">
              <h3 className="cookies-type__title">Preference Cookies</h3>
              <p className="cookies-type__text">
                Store your settings such as theme, layout, and personalization choices.
              </p>
            </div>
          </div>

          <div className="cookies-section">
            <h2 className="cookies-section__title">4. Third-party cookies</h2>
            <p className="cookies-section__text">
              Some features may use third-party services (such as analytics or authentication providers),
              which may place cookies on your device.
            </p>
          </div>

          <div className="cookies-section">
            <h2 className="cookies-section__title">5. Managing cookies</h2>
            <p className="cookies-section__text">
              You can control or delete cookies through your browser settings. However,
              disabling cookies may affect how Magic Mail works.
            </p>
          </div>

          <div className="cookies-section">
            <h2 className="cookies-section__title">6. Updates to this policy</h2>
            <p className="cookies-section__text">
              We may update this Cookies Policy from time to time. Changes will be reflected on this page.
            </p>
          </div>

          <div className="cookies-section">
            <h2 className="cookies-section__title">7. Contact</h2>
            <p className="cookies-section__text">
              If you have any questions about cookies, contact us at:
              <br />
              <span className="cookies-section__highlight">
                support@magicmail.com
              </span>
            </p>
          </div>

        </section>
      </div>
    </main>
  )
}