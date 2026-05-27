'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/app/hooks' 

type PricingPopupProps = {
  onClose: () => void
}

const PricingPopup = ({ onClose }: PricingPopupProps) => {
  const router = useRouter()
  
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  const handleFreeTierClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onClose() 
    
    if (isAuthenticated) {
      router.push('/scroll')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="pricing-popup__overlay">
      <div className="pricing-popup">
        <button className="pricing-popup__close" onClick={onClose}>
          ✕
        </button>

        <h1 className="pricing-popup__title">SUBSCRIPTION TIERS</h1>

        <p className="pricing-popup__text">
          Choose the plan that fits your inbox size. Each tier includes fast
          cleanup, smarter spam detection, and better unsubscribe automation.
        </p>

        <p className="pricing-popup__text">
          Payments are handled securely with LemonSqueezy. Click any tier below to
          view full details and continue to checkout.
        </p>

        <p className="pricing-popup__text">
          Free tier is available for everyone with smaller limits.
          <Link href="/subscriptions/free" style={{ textDecoration: 'underline', marginLeft: 6 }}>
            See Free limits
          </Link>
        </p>

        <h2 className="pricing-popup__subtitle">AVAILABLE TIERS</h2>

        <div className="pricing-popup__bundles">
          <Link href="/subscriptions/starter" className="bundle bundle--highlight">
            <span className="bundle__badge">
              BEST <br /> ENTRY <br /> PLAN
            </span>
            <p className="bundle__mins">Starter</p>
            <p className="bundle__price">$7</p>
            <p className="bundle__time">Monthly</p>
            <div className="bundle__features">
              <p className="bundle__feature">10k emails/month</p>
              <p className="bundle__feature">5 category</p>
              <p className="bundle__feature">7 priority keywords</p>
            </div>
          </Link>

          <Link href="/subscriptions/growth" className="bundle">
            <p className="bundle__mins">Growth</p>
            <p className="bundle__price">$15</p>
            <p className="bundle__time">Monthly</p>
            <div className="bundle__features">
              <p className="bundle__feature">50k emails/month</p>
              <p className="bundle__feature">20 category</p>
              <p className="bundle__feature">25 priority keywords</p>
              <p className="bundle__feature">Email support</p>
            </div>
          </Link>

          <Link href="/subscriptions/pro" className="bundle">
            <p className="bundle__mins">Pro</p>
            <p className="bundle__price">$29</p>
            <p className="bundle__time">Monthly</p>
            <div className="bundle__features">
              <p className="bundle__feature">200k emails/month</p>
              <p className="bundle__feature">50 category</p>
              <p className="bundle__feature">70 priority keywords</p>
              <p className="bundle__feature">Email support</p>
            </div>
          </Link>
        </div>

        <a 
          href="#" 
          className="pricing-popup__cta"
          onClick={handleFreeTierClick}
        >
          Continue with FREE Tier
        </a>

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