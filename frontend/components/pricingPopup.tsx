'use client'

import React from 'react'

type PricingPopupProps = {
  onClose: () => void
}

const PricingPopup = ({ onClose }: PricingPopupProps) => {
  return (
    <div className="pricing-popup__overlay">
      <div className="pricing-popup">
        <button className="pricing-popup__close" onClick={onClose}>
          ✕
        </button>

        <h1 className="pricing-popup__title">
           OUR PRICING
        </h1>

        <p className="pricing-popup__text">
          As of today, our Pay-As-You-Clean rate for Sweep My Mail is changing.
          The cost per email cleanup is increasing slightly to help us continue
          improving spam detection, unsubscribe accuracy, and speed.
        </p>

        <p className="pricing-popup__text">
          Don’t worry — you can still clean your inbox affordably using bundles.
          Bundles now last longer, giving you more flexibility. And for a limited
          time, we’re introducing a special starter bundle designed for quick inbox
          cleanups.
        </p>

        <h2 className="pricing-popup__subtitle">CLEANING BUNDLES</h2>

        <div className="pricing-popup__bundles">
          <div className="bundle bundle--highlight">
            <span className="bundle__badge">
              LIMITED <br /> TIME <br /> OFFER
            </span>
            <p className="bundle__mins">500 emails</p>
            <p className="bundle__price">$2.99</p>
            <p className="bundle__time">Valid for 24 hours</p>
          </div>

          <div className="bundle">
            <p className="bundle__mins">1,500 emails</p>
            <p className="bundle__price">$4.99</p>
            <p className="bundle__time">Valid for 7 days</p>
          </div>

          <div className="bundle">
            <p className="bundle__mins">3,500 emails</p>
            <p className="bundle__price">$8.99</p>
            <p className="bundle__time">Valid for 14 days</p>
          </div>
        </div>

        <button className="pricing-popup__cta">
          GET A CLEANING BUNDLE
        </button>

        <button
          className="pricing-popup__dismiss"
          onClick={onClose}
        >
          DISMISS
        </button>

        <p className="pricing-popup__feedback">
          Have feedback on this change? <span>Let us know here.</span>
        </p>
      </div>
    </div>
  )
}

export default PricingPopup
