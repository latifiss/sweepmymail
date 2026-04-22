'use client'

import React from 'react'

const InfoPage = () => {
  return (
    <div className="info-page">

      <main className="info-content">
        <h1 className="info-title">YOUR CLEANING GUIDE</h1>
        <p className="info-intro">
          Here’s a quick look at how Sweep My Mail helps you clean your inbox.
        </p>

        <section className="info-section">
          <div className="info-row">
            <span className="info-icon info-icon--you">📍</span>
            <p>
              <strong>That’s You!</strong> We start by scanning your inbox to
              understand what emails matter to you.
            </p>
          </div>

          <div className="info-row">
            <span className="info-icon info-icon--delete">🗑️</span>
            <p>
              <strong>Delete</strong> removes unwanted emails permanently —
              spam, promotions, and clutter you no longer need.
            </p>
          </div>

          <div className="info-row">
            <span className="info-icon info-icon--keep">⭐</span>
            <p>
              <strong>Keep</strong> protects important emails so they’re never
              touched during cleaning.
            </p>
          </div>

          <div className="info-row">
            <span className="info-icon info-icon--unsubscribe">🔕</span>
            <p>
              <strong>Unsubscribe</strong> stops future emails from senders
              without deleting past messages.
            </p>
          </div>

          <div className="info-row">
            <span className="info-icon info-icon--bulk">⚡</span>
            <p>
              <strong>Bulk Clean</strong> lets you clean thousands of emails at
              once — fast and safely.
            </p>
          </div>

          <div className="info-row">
            <span className="info-icon info-icon--safe">🛡️</span>
            <p>
              <strong>Safe by Design</strong> — nothing happens without your
              approval. You stay in full control.
            </p>
          </div>
        </section>

        <h2 className="info-subtitle">HOW TO USE IT</h2>

        <section className="info-section">
          <div className="info-row">
            <span className="info-icon info-icon--step">1</span>
            <p>Select emails or senders you want to clean.</p>
          </div>

          <div className="info-row">
            <span className="info-icon info-icon--step">2</span>
            <p>Choose Delete, Keep, or Unsubscribe.</p>
          </div>

          <div className="info-row">
            <span className="info-icon info-icon--step">3</span>
            <p>Confirm — and enjoy a cleaner inbox.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default InfoPage
