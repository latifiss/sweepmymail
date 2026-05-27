import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Terms and Conditions | Magic Mail',
  description: 'Terms of Service for Magic Mail - AI-powered inbox operations platform for Gmail.',
};

export default function TermsPage() {
  const currentYear = new Date().getFullYear();
  const effectiveDate = 'January 1, 2025';

  return (
    <main className="terms-page">
      <div className="terms-page__background" />
      
      <div className="terms-page__container">
        <div className="terms-card">
          <div className="terms-card__header">
            <Link href="/" className="terms-card__back-link">
              <ChevronRightIcon className="terms-card__back-icon" />
              Back to Magic Mail
            </Link>
            <h1 className="terms-card__title">Terms and Conditions</h1>
            <p className="terms-card__effective-date">Effective Date: {effectiveDate}</p>
            <p className="terms-card__intro">
              Welcome to Magic Mail (<span className="terms-card__domain">mymagicmail.app</span>). 
              By accessing or using our AI-powered inbox operations platform, you agree to be bound by 
              these Terms and Conditions. Please read them carefully.
            </p>
          </div>

          <div className="terms-card__content">
            <div className="terms-card__nav">
              <h3 className="terms-card__nav-title">Contents</h3>
              <ul className="terms-card__nav-list">
                <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                <li><a href="#services">2. Description of Services</a></li>
                <li><a href="#eligibility">3. Eligibility</a></li>
                <li><a href="#account">4. Account and Gmail Integration</a></li>
                <li><a href="#payments">5. Payments and Subscriptions</a></li>
                <li><a href="#free-tier">6. Free Tier Limitations</a></li>
                <li><a href="#prohibited">7. Prohibited Uses</a></li>
                <li><a href="#data-privacy">8. Data and Privacy</a></li>
                <li><a href="#intellectual">9. Intellectual Property</a></li>
                <li><a href="#termination">10. Termination</a></li>
                <li><a href="#disclaimers">11. Disclaimers</a></li>
                <li><a href="#limitation">12. Limitation of Liability</a></li>
                <li><a href="#indemnification">13. Indemnification</a></li>
                <li><a href="#changes">14. Changes to Terms</a></li>
                <li><a href="#governing-law">15. Governing Law</a></li>
                <li><a href="#contact">16. Contact Information</a></li>
              </ul>
            </div>

            <div className="terms-card__sections">
              <section id="acceptance" className="terms-section">
                <h2 className="terms-section__title">1. Acceptance of Terms</h2>
                <p>By registering for, accessing, or using Magic Mail (&quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms. If you do not agree to these Terms, you must not use the Service.</p>
              </section>

              <section id="services" className="terms-section">
                <h2 className="terms-section__title">2. Description of Services</h2>
                <p>Magic Mail is an AI-powered inbox operations platform for Gmail that provides the following features:</p>
                <ul className="terms-section__list">
                  <li>Smart unsubscribe suggestions and bulk unsubscribe management</li>
                  <li>Email rollup and digest creation (daily, weekly, or custom summaries)</li>
                  <li>AI-driven email categorization (primary, social, promotions, updates, forums)</li>
                  <li>Priority marking and smart inbox sorting</li>
                  <li>Automated filtering and folder organization</li>
                  <li>Email analytics and productivity insights</li>
                </ul>
                <p>We reserve the right to modify, suspend, or discontinue any feature of the Service at any time, with or without notice to you.</p>
              </section>

              <section id="eligibility" className="terms-section">
                <h2 className="terms-section__title">3. Eligibility</h2>
                <p>You must be at least 18 years of age to use the Service. By using Magic Mail, you represent and warrant that you meet this age requirement and have the full power and authority to enter into these Terms.</p>
              </section>

              <section id="account" className="terms-section">
                <h2 className="terms-section__title">4. Account and Gmail Integration</h2>
                <p>To use Magic Mail, you must:</p>
                <ul className="terms-section__list">
                  <li>Have an active Gmail account (provided by Google)</li>
                  <li>Authorize Magic Mail to access your Gmail account via Google OAuth</li>
                  <li>Grant the specific permissions requested during the authorization flow</li>
                </ul>
                <p>You are responsible for maintaining the security of your Gmail account and any activity that occurs under your authorization. You agree to immediately notify us of any unauthorized access to your Gmail account or the Service.</p>
                <p className="terms-section__note">Note: Magic Mail only requests the minimum required permissions (read, modify, and delete emails) to perform its core functions. We never sell or share your email content with third parties for marketing purposes.</p>
              </section>

              <section id="payments" className="terms-section">
                <h2 className="terms-section__title">5. Payments and Subscriptions</h2>
                <p>Certain features of Magic Mail require a paid subscription (&quot;Premium Plan&quot;). By purchasing a subscription, you agree to pay all applicable fees as described at the time of purchase.</p>
                <ul className="terms-section__list">
                  <li><strong>Billing:</strong> Subscriptions are billed in advance on a monthly or annual basis, depending on your selected plan.</li>
                  <li><strong>Auto-renewal:</strong> Your subscription will automatically renew unless you cancel it at least 24 hours before the end of your current billing period.</li>
                  <li><strong>Cancellation:</strong> You may cancel your subscription at any time via your account settings. Upon cancellation, you will retain access to Premium features until the end of your current billing period.</li>
                  <li><strong>Refunds:</strong> All fees are non-refundable except as required by applicable law or as determined by us in our sole discretion.</li>
                  <li><strong>Price Changes:</strong> We may adjust subscription prices at any time. We will notify you at least 30 days in advance of any price change affecting your active subscription.</li>
                </ul>
              </section>

              <section id="free-tier" className="terms-section">
                <h2 className="terms-section__title">6. Free Tier Limitations</h2>
                <p>Magic Mail offers a free tier with the following limitations:</p>
                <ul className="terms-section__list">
                  <li>Up to 100 emails processed per day</li>
                  <li>Basic categorization (limited accuracy on high-volume accounts)</li>
                  <li>Daily summaries only (no hourly or custom intervals)</li>
                  <li>Limited to 3 active unsubscribe suggestions per week</li>
                  <li>No priority marking or advanced filtering</li>
                  <li>Community-based email support (response within 72 hours)</li>
                </ul>
                <p>We reserve the right to modify free tier limitations at any time. Exceeding free tier limits will require upgrading to a Premium Plan.</p>
              </section>

              <section id="prohibited" className="terms-section">
                <h2 className="terms-section__title">7. Prohibited Uses</h2>
                <p>You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service. Prohibited activities include, but are not limited to:</p>
                <ul className="terms-section__list">
                  <li>Attempting to bypass any limitations or rate limits of the Service</li>
                  <li>Using the Service to send spam, phishing emails, or unsolicited communications</li>
                  <li>Reverse engineering, decompiling, or disassembling any portion of the Service</li>
                  <li>Accessing the Service through automated means (bots, scrapers, etc.) without our express permission</li>
                  <li>Sharing your account credentials with others</li>
                  <li>Using the Service to violate Google&#39;s Terms of Service or Gmail&#39;s policies</li>
                  <li>Interfering with other users&#39; enjoyment of the Service</li>
                </ul>
              </section>

              <section id="data-privacy" className="terms-section">
                <h2 className="terms-section__title">8. Data and Privacy</h2>
                <p>Your privacy is critically important to us. By using Magic Mail, you acknowledge that we will process your email data as described in our <Link href="/privacy" className="terms-section__link">Privacy Policy</Link>. Key points include:</p>
                <ul className="terms-section__list">
                  <li>We access your email content only to provide the features you request (unsubscribe, categorize, summarize, etc.)</li>
                  <li>Email content is processed by our AI models but is not used to train models for other customers</li>
                  <li>We retain email metadata (subject lines, sender, timestamps) for up to 30 days for analytics</li>
                  <li>You may request deletion of your data at any time via your account settings</li>
                  <li>We comply with GDPR, CCPA, and other applicable privacy regulations</li>
                </ul>
                <p>You grant Magic Mail a limited, revocable license to access your Gmail account to perform the functions you request. You may revoke this access at any time via your Google Account permissions page.</p>
              </section>

              <section id="intellectual" className="terms-section">
                <h2 className="terms-section__title">9. Intellectual Property</h2>
                <p>All intellectual property rights in the Service, including but not limited to software, algorithms, trademarks, logos, and content created by Magic Mail, are owned by us or our licensors. You are granted a limited, non-exclusive, non-transferable license to use the Service for your personal or internal business purposes. You may not copy, modify, or distribute any part of the Service without our prior written consent.</p>
                <p>Any feedback, suggestions, or ideas you provide about the Service become our property and may be used without restriction or compensation to you.</p>
              </section>

              <section id="termination" className="terms-section">
                <h2 className="terms-section__title">10. Termination</h2>
                <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will cease immediately. You may also terminate your account at any time via your account settings. Sections that by their nature should survive termination (including but not limited to intellectual property, disclaimers, limitation of liability, and governing law) shall survive.</p>
              </section>

              <section id="disclaimers" className="terms-section">
                <h2 className="terms-section__title">11. Disclaimers</h2>
                <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:</p>
                <ul className="terms-section__list">
                  <li>The Service will meet your specific requirements</li>
                  <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                  <li>The results obtained from using the Service will be accurate or reliable</li>
                  <li>Any errors in the Service will be corrected</li>
                </ul>
                <p>AI-powered features (categorization, summarization, unsubscribe suggestions) are provided as a convenience and may contain errors. You are ultimately responsible for decisions made based on our suggestions. Magic Mail is not liable for missed emails, incorrect categorization, or actions taken based on AI-generated summaries.</p>
              </section>

              <section id="limitation" className="terms-section">
                <h2 className="terms-section__title">12. Limitation of Liability</h2>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL MAGIC MAIL, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:</p>
                <ul className="terms-section__list">
                  <li>Your use or inability to use the Service</li>
                  <li>Any conduct or content of any third party on the Service</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                  <li>Statements or conduct of any third party on the Service</li>
                </ul>
                <p>IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU PAID US DURING THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100) IF YOU HAVE NOT PAID US ANY AMOUNTS.</p>
              </section>

              <section id="indemnification" className="terms-section">
                <h2 className="terms-section__title">13. Indemnification</h2>
                <p>You agree to defend, indemnify, and hold harmless Magic Mail and its affiliates, officers, agents, and employees from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to:</p>
                <ul className="terms-section__list">
                  <li>Your use of the Service in violation of these Terms</li>
                  <li>Your violation of any third-party rights, including Gmail&apos;s Terms of Service</li>
                  <li>Any content you access or process using the Service</li>
                </ul>
              </section>

              <section id="changes" className="terms-section">
                <h2 className="terms-section__title">14. Changes to Terms</h2>
                <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes by:</p>
                <ul className="terms-section__list">
                  <li>Posting the updated Terms on this page</li>
                  <li>Sending an email to the address associated with your account (if applicable)</li>
                  <li>Displaying a notice within the Service</li>
                </ul>
                <p>The &quot;Effective Date&quot; at the top of this page indicates when these Terms were last revised. Your continued use of the Service after any changes constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.</p>
              </section>

              <section id="governing-law" className="terms-section">
                <h2 className="terms-section__title">15. Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any legal action arising out of or relating to these Terms or the Service shall be brought exclusively in the federal or state courts located in Delaware, and you consent to the personal jurisdiction of such courts.</p>
              </section>

              <section id="contact" className="terms-section">
                <h2 className="terms-section__title">16. Contact Information</h2>
                <p>If you have any questions about these Terms, please contact us at:</p>
                <div className="terms-section__contact">
                  <p><strong>Magic Mail Support</strong></p>
                  <p>Email: <a href="mailto:legal@mymagicmail.app">legal@mymagicmail.app</a></p>
                  <p>Website: <a href="https://mymagicmail.app" target="_blank" rel="noopener noreferrer">mymagicmail.app</a></p>
                </div>
              </section>
            </div>
          </div>

          <div className="terms-card__footer">
            <p>© {currentYear} Magic Mail. All rights reserved.</p>
            <p><Link href="/privacy" className="terms-card__footer-link">Privacy Policy</Link> | <Link href="/terms" className="terms-card__footer-link">Terms of Service</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
}