'use client'

import React, { useMemo } from 'react'

export default function AboutPage() {
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <main className="about-page">
      <div className="about-page__container">

        <header className="about-header">
          <h1 className="about-header__title">About Magic Mail</h1>
          <p className="about-header__subtitle">
            A modern way to take control of your inbox.
          </p>
          <span className="about-header__badge">Est. {year}</span>
        </header>

        <section className="about-content">

          <div className="about-section">
            <h2 className="about-section__title">Our Mission</h2>
            <p className="about-section__text">
              Magic Mail is built to simplify email management for individuals and teams.
              We believe email should help productivity, not create stress or clutter.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-section__title">What We Do</h2>
            <p className="about-section__text">
              We provide smart email organization tools that automatically categorize,
              filter, and structure your inbox so you can focus on what matters.
            </p>

            <ul className="about-section__list">
              <li>AI-powered email categorization</li>
              <li>Smart inbox filtering and organization</li>
              <li>Custom categories and workflows</li>
              <li>Fast, modern email interface</li>
            </ul>
          </div>

          <div className="about-section">
            <h2 className="about-section__title">Why Magic Mail?</h2>
            <p className="about-section__text">
              Traditional email tools are overwhelming. Magic Mail is designed to reduce noise,
              highlight important messages, and help you stay in control.
            </p>
          </div>

          <div className="about-section about-section--highlight">
            <h2 className="about-section__title">Built for Productivity</h2>
            <p className="about-section__text">
              Whether you&apos;re a student, professional, or business owner,
              Magic Mail adapts to your workflow and scales with your needs.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-section__title">Our Vision</h2>
            <p className="about-section__text">
              We aim to redefine how people interact with email by making it intelligent,
              structured, and effortless.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-section__title">Contact Us</h2>
            <p className="about-section__text">
              Have questions or feedback?
              <br />
              <span className="about-section__highlight">
                support@magicmail.com
              </span>
            </p>
          </div>

        </section>
      </div>
    </main>
  )
}