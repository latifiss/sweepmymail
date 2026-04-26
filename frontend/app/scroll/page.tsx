'use client'

import React, { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollSection from '@/components/scrollSection'
import PricingPopup from '@/components/pricingPopup'
import Image from 'next/image'
import CellDisplay from '@/components/cellDisplay'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'

// Define section colors based on your variables
const sectionColors = {
  hero: '#ffffff',
  features: '#f5f5f5',
  autoCategorize: '#e8f2ff',
  priority: '#fddae6',
  summarize: '#d4edda',
  pricing: '#0a6f50',
  cta: '#ffc000',
  footer: '#343a40'
}

export default function HomePage() {
  const router = useRouter()
  const token = useAppSelector(selectAuthToken)
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    if (token) {
      router.replace('/subscriptions')
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    document.body.style.backgroundColor = '#ffffff'
    ScrollTrigger.refresh()
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      document.body.style.backgroundColor = ''
    }
  }, [router, token])

  if (token) {
    return null
  }

  return (
    <main className="scroll-page">
      {/* Hero Section */}
      <ScrollSection id="hero" color={sectionColors.hero}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title hero-title--dark">
              Sweep My Mail
              <span className="hero-title__highlight"> Clean Inbox, Clear Mind</span>
            </h1>
            <p className="hero-description hero-description--dark">
              AI-powered email management that actually works. Delete spam, summarize newsletters,
              auto-categorize emails, and never miss what matters most.
            </p>
            <button 
              className="btn btn--primary btn--large"
              onClick={() => setShowPricing(true)}
            >
              Get started
            </button>
            <p className="hero-note">No credit card required • Free up to 100 emails</p>
          </div>
        </div>
      </ScrollSection>

      {/* Feature 1: Clean Emails to Trash - Text Left, Demo Right */}
      <ScrollSection id="clean-emails" color={sectionColors.features}>
        <div className="container">
          <div className="feature-block">
            <div className="feature-block__content">
              <h2 className="feature-title">
                Delete to Trash
                <span className="feature-title__highlight feature-title__highlight--shadow-1"> Bulk Email Cleanup</span>
              </h2>
              <p className="feature-description">
                Instantly identify and delete thousands of unwanted emails with one click. 
                Our AI scans your inbox for spam, old newsletters, and promotional emails.
              </p>
              <ul className="feature-list">
                <li>✓ Bulk delete thousands of emails in seconds</li>
                <li>✓ Smart spam detection with 99% accuracy</li>
                <li>✓ Safe - moves to trash first</li>
                <li>✓ Recover anytime within 30 days</li>
              </ul>
                          <button className="btn btn--opt-1">
                              <div className='btn__content'>
                                  <div className='btn__text'>Learn More</div>
                                  <Image src="/icons/right-white.svg" alt="arrow" width={16} height={16} style={{ marginLeft: '8px' }} />
                              </div>
              </button>
            </div>
            <div className="feature-block__visual">
              <div className="demo-cell demo-cell--shadow-1 demo-cell--open">
                <CellDisplay />
              </div>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Feature 2: Auto-Categorize Emails - Text Right, Demo Left */}
      <ScrollSection id="auto-categorize" color={sectionColors.autoCategorize}>
        <div className="container">
          <div className="feature-block feature-block--reverse">
            <div className="feature-block__content">
              <h2 className="feature-title">
                Auto-Categorize
                <span className="feature-title__highlight feature-title__highlight--shadow-2"> Smart Organization</span>
              </h2>
              <p className="feature-description">
                Let AI automatically sort incoming emails into smart categories. 
                No more manual sorting - just a perfectly organized inbox.
              </p>
              <ul className="feature-list">
                <li>✓ 7+ smart categories for different email types</li>
                <li>✓ Learns from your behavior over time</li>
                <li>✓ Custom rules for specific senders</li>
                <li>✓ Instant categorization as emails arrive</li>
              </ul>
                          <button className="btn btn--opt-2">
                              <div className='btn__content'>
                                  <div className='btn__text'>Customize Categories</div>
                                  <Image src="/icons/right-white.svg" alt="arrow" width={16} height={16} style={{ marginLeft: '8px' }} />
                              </div>
              </button>
            </div>
            <div className="feature-block__visual">
              <div className="demo-cell demo-cell--shadow-2 demo-cell--open">
                <div className="demo-cell__side">
                  <div className="demo-cell__toggle-placeholder">
                    <Image
                      src="/icons/up.svg"
                      alt="toggle"
                      width={24}
                      height={24}
                      className="demo-cell__arrow"
                    />
                  </div>
                </div>
                <div className="demo-cell__content">
                  <div className="demo-cell__info">
                    <div className="demo-cell__right">
                      <p className="demo-cell__right__count">47</p>
                      <p className="demo-cell__right__text">emails</p>
                    </div>
                    <div className="demo-cell__wrapper">
                      <div className="demo-cell__top">
                        <div className="demo-cell__top__info">
                          <Image src="/icons/sifted.png" width={20} height={20} alt="category" />
                          <p className="demo-cell__top__info__text">Smart Categories</p>
                        </div>
                        <div className="unread-tag">AI Sorted</div>
                      </div>
                      <div className="demo-cell__bottom">Auto-organized by content</div>
                    </div>
                  </div>
                  <div className="demo-cell__dropdown">
                    <div className="category-grid-demo">
                      <div className="category-demo category-demo--primary">📌 Primary (12)</div>
                      <div className="category-demo category-demo--social">💬 Social (8)</div>
                      <div className="category-demo category-demo--promo">🎁 Promotions (15)</div>
                      <div className="category-demo category-demo--updates">📰 Updates (7)</div>
                      <div className="category-demo category-demo--forums">💭 Forums (3)</div>
                      <div className="category-demo category-demo--priority">⭐ Priority (2)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Feature 3: Priority Keywords - Text Left, Demo Right */}
      <ScrollSection id="priority-emails" color={sectionColors.priority}>
        <div className="container">
          <div className="feature-block">
            <div className="feature-block__content">
              <h2 className="feature-title">
                Priority Keywords
                <span className="feature-title__highlight feature-title__highlight--shadow-3"> Never Miss What Matters</span>
              </h2>
              <p className="feature-description">
                Set custom keywords and watch important emails rise to the top. 
                Whether it's "invoice", "contract", or your boss's name.
              </p>
              <div className="keyword-demo">
                <div className="keyword-tag">💰 invoice</div>
                <div className="keyword-tag">📄 contract</div>
                <div className="keyword-tag">👨‍💼 urgent</div>
                <div className="keyword-tag">⭐ meeting</div>
                <button className="keyword-add">+ Add Keyword</button>
              </div>
                          <button className="btn btn--opt-3">
                              <div className='btn__content'>
                                  <div className='btn__text'>Set Your Priorities</div>
                                  <Image src="/icons/right-white.svg" alt="arrow" width={16} height={16} style={{ marginLeft: '8px' }} />
                              </div>
              </button>
            </div>
            <div className="feature-block__visual">
              <div className="demo-cell demo-cell--shadow-3 demo-cell--open priority-demo">
                <div className="demo-cell__side">
                  <div className="demo-cell__toggle-placeholder">
                    <Image
                      src="/icons/up.svg"
                      alt="toggle"
                      width={24}
                      height={24}
                      className="demo-cell__arrow"
                    />
                  </div>
                </div>
                <div className="demo-cell__content">
                  <div className="demo-cell__info">
                    <div className="demo-cell__right">
                      <p className="demo-cell__right__count">3</p>
                      <p className="demo-cell__right__text">priority</p>
                    </div>
                    <div className="demo-cell__wrapper">
                                          <div className="demo-cell__top">
                                              
                        <div className="demo-cell__top__info">
                          <Image src="/icons/sifted.png" width={20} height={20} alt="priority" />
                          <p className="demo-cell__top__info__text">Priority Inbox</p>
                        </div>
                        <div className="unread-tag unread-tag--priority">High Priority</div>
                      </div>
                      <div className="demo-cell__bottom">Based on your keywords</div>
                    </div>
                  </div>
                  <div className="demo-cell__dropdown">
                    <div className="priority-email-demo priority-email-demo--high">
                      <span>⭐</span>
                      <div>
                        <strong>URGENT: Contract Review Needed</strong>
                        <p>from legal@company.com</p>
                      </div>
                      <span className="priority-badge-demo">keyword: contract</span>
                    </div>
                    <div className="priority-email-demo priority-email-demo--medium">
                      <span>📊</span>
                      <div>
                        <strong>Monthly Report - Action Required</strong>
                        <p>from finance@company.com</p>
                      </div>
                      <span className="priority-badge-demo">keyword: report</span>
                    </div>
                    <div className="priority-email-demo priority-email-demo--normal">
                      <span>📧</span>
                      <div>
                        <strong>Team Meeting Tomorrow</strong>
                        <p>from manager@company.com</p>
                      </div>
                      <span className="priority-badge-demo">keyword: meeting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Feature 4: Daily Summaries - Text Right, Demo Left */}
      <ScrollSection id="summarize" color={sectionColors.summarize}>
        <div className="container">
          <div className="feature-block feature-block--reverse">
            <div className="feature-block__content">
              <h2 className="feature-title">
                Daily Summaries
                <span className="feature-title__highlight feature-title__highlight--shadow-4"> AI-Powered Insights</span>
              </h2>
              <p className="feature-description">
                Get a concise AI-generated summary of your daily email activity. 
                Read what matters most in 30 seconds or less.
              </p>
              <ul className="feature-list">
                <li>✓ AI-generated email digests</li>
                <li>✓ Key action items highlighted</li>
                <li>✓ Smart notifications for urgent matters</li>
                <li>✓ Customizable summary frequency</li>
              </ul>
                          <button className="btn btn--opt-4">
                              <div className='btn__content'>
                                  <div className='btn__text'>Try Daily Digest</div>
                                  <Image src="/icons/right-white.svg" alt="arrow" width={16} height={16} style={{ marginLeft: '8px' }} />
                              </div>
                          </button>
            </div>
            <div className="feature-block__visual">
              <div className="demo-cell demo-cell--shadow-4 demo-cell--open summary-demo">
                <div className="demo-cell__side">
                  <div className="demo-cell__toggle-placeholder">
                    <Image
                      src="/icons/up.svg"
                      alt="toggle"
                      width={24}
                      height={24}
                      className="demo-cell__arrow"
                    />
                  </div>
                </div>
                <div className="demo-cell__content">
                  <div className="demo-cell__info">
                    <div className="demo-cell__right">
                      <p className="demo-cell__right__count">47</p>
                      <p className="demo-cell__right__text">total</p>
                    </div>
                    <div className="demo-cell__wrapper">
                      <div className="demo-cell__top">
                        <div className="demo-cell__top__info">
                          <Image src="/icons/sifted.png" width={20} height={20} alt="summary" />
                          <p className="demo-cell__top__info__text">Daily Digest</p>
                        </div>
                        <div className="unread-tag">April 9, 2026</div>
                      </div>
                      <div className="demo-cell__bottom">AI-generated summary</div>
                    </div>
                  </div>
                  <div className="demo-cell__dropdown">
                    <div className="summary-item-demo">
                      <strong>📬 47 emails received</strong>
                      <span>23 categorized as promotions</span>
                    </div>
                    <div className="summary-item-demo">
                      <strong>⭐ 3 priority emails</strong>
                      <span>Contract, Invoice, Urgent Request</span>
                    </div>
                    <div className="summary-item-demo">
                      <strong>🗑️ 12 spam emails</strong>
                      <span>Automatically filtered</span>
                    </div>
                    <div className="summary-ai-demo">
                      🤖 <strong>AI Summary:</strong> Your Amazon order has shipped. 
                      Client contract needs signature by Friday. Meeting rescheduled to 3pm.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Pricing Section */}
      <ScrollSection id="pricing" color={sectionColors.pricing}>
        <div className="container">
          <div className="pricing-section">
            <h2 className="section-title section-title--light">
              Simple, Transparent Pricing
            </h2>
            <p className="section-subtitle section-subtitle--light">
              Start free, pay only when you need more. No subscriptions.
            </p>
            <div className="pricing-stats">
              <div className="stat-card">
                <div className="stat-number">100</div>
                <div className="stat-label">Free Emails</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">AI Processing</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
            <button 
              className="btn btn--white btn--large"
              onClick={() => setShowPricing(true)}
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </ScrollSection>

      {/* CTA Section */}
      <ScrollSection id="cta" color={sectionColors.cta}>
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title cta-title--dark">
              Ready to Transform Your Inbox?
            </h2>
            <p className="cta-description cta-description--dark">
              Join 50,000+ users who save 2+ hours daily
            </p>
            <div className="cta-buttons">
              <button 
                className="btn btn--dark btn--large"
                onClick={() => setShowPricing(true)}
              >
                Start Free Trial
              </button>
              <button className="btn btn--outline-dark btn--large">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Footer Section */}
      <ScrollSection id="footer" color={sectionColors.footer}>
        <div className="container">
          <footer className="footer">
            <div className="footer__content">
              <div className="footer__logo">
                <h3>Sweep My Mail</h3>
                <p>Clean inbox. Clear mind.</p>
              </div>
              <div className="footer__links">
                <div className="footer__links-column">
                  <h4>Product</h4>
                  <a href="#">Features</a>
                  <a href="#">Pricing</a>
                  <a href="#">Demo</a>
                </div>
                <div className="footer__links-column">
                  <h4>Company</h4>
                  <a href="#">About</a>
                  <a href="#">Blog</a>
                  <a href="#">Contact</a>
                </div>
                <div className="footer__links-column">
                  <h4>Legal</h4>
                  <a href="#">Privacy</a>
                  <a href="#">Terms</a>
                </div>
              </div>
              <div className="footer__copyright">
                © 2024 Sweep My Mail. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </ScrollSection>

      {/* Pricing Popup */}
      {showPricing && (
        <PricingPopup onClose={() => setShowPricing(false)} />
      )}
    </main>
  )
}