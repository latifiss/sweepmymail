import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Refund Policy | Magic Mail',
  description: 'Refund policy and cancellation terms for Magic Mail - AI-powered inbox operations platform for Gmail.',
};

export default function RefundPolicyPage() {
  const currentYear = new Date().getFullYear();
  const effectiveDate = 'January 1, 2025';

  return (
    <main className="refund-page">
      <div className="refund-page__background" />
      
      <div className="refund-page__container">
        <div className="refund-card">
          <div className="refund-card__header">
            <Link href="/" className="refund-card__back-link">
              <ChevronRightIcon className="refund-card__back-icon" />
              Back to Magic Mail
            </Link>
            <h1 className="refund-card__title">Refund Policy</h1>
            <p className="refund-card__effective-date">Effective Date: {effectiveDate}</p>
            <p className="refund-card__intro">
              At Magic Mail (<span className="refund-card__domain">mymagicmail.app</span>), we want you to be completely 
              satisfied with your experience. This Refund Policy outlines the terms and conditions 
              under which refunds may be issued for our Premium subscription plans.
            </p>
          </div>

          <div className="refund-card__content">
            <div className="refund-card__nav">
              <h3 className="refund-card__nav-title">Contents</h3>
              <ul className="refund-card__nav-list">
                <li><a href="#overview">1. Overview</a></li>
                <li><a href="#free-trial">2. Free Trial</a></li>
                <li><a href="#refund-eligibility">3. Refund Eligibility</a></li>
                <li><a href="#monthly-subscription">4. Monthly Subscriptions</a></li>
                <li><a href="#annual-subscription">5. Annual Subscriptions</a></li>
                <li><a href="#service-issues">6. Service Issues & Downtime</a></li>
                <li><a href="#cancellation">7. How to Cancel</a></li>
                <li><a href="#refund-process">8. Refund Process</a></li>
                <li><a href="#non-refundable">9. Non-Refundable Items</a></li>
                <li><a href="#chargebacks">10. Chargebacks</a></li>
                <li><a href="#changes">11. Changes to This Policy</a></li>
                <li><a href="#contact">12. Contact Us</a></li>
              </ul>
            </div>

            <div className="refund-card__sections">
              <section id="overview" className="refund-section">
                <h2 className="refund-section__title">1. Overview</h2>
                <p>
                  Magic Mail offers a freemium model with a Free Tier that allows you to test core features 
                  before committing to a paid subscription. We believe in transparency and fairness when 
                  it comes to refunds. This policy applies to all Premium subscription plans purchased 
                  directly from Magic Mail.
                </p>
                <p>
                  By purchasing a subscription, you acknowledge that you have read, understood, and 
                  agree to this Refund Policy.
                </p>
              </section>

              <section id="free-trial" className="refund-section">
                <h2 className="refund-section__title">2. Free Trial</h2>
                <p>
                  New users who sign up for Magic Mail automatically receive access to our Free Tier. 
                  We may, from time to time, offer a limited-time Premium trial (e.g., 7 days or 14 days) 
                  to eligible users. During any trial period:
                </p>
                <ul className="refund-section__list">
                  <li>You will not be charged for Premium features during the trial</li>
                  <li>You may cancel at any time before the trial ends to avoid being charged</li>
                  <li>No refund is applicable for trial periods as no payment has been collected</li>
                  <li>We do not offer retroactive refunds for users who forgot to cancel before the trial ended</li>
                </ul>
                <p className="refund-section__note">
                  <strong>Pro tip:</strong> Set a calendar reminder for the day before your trial ends 
                  to evaluate whether you want to continue with a paid subscription.
                </p>
              </section>

              <section id="refund-eligibility" className="refund-section">
                <h2 className="refund-section__title">3. Refund Eligibility</h2>
                <p>
                  Magic Mail offers refunds under specific circumstances. Generally, we operate on a 
                  <strong> no-refund policy for partial months or unused portions of a subscription</strong>, 
                  as is standard with SaaS products. However, the following exceptions apply:
                </p>
                <ul className="refund-section__list">
                  <li><strong>First-time subscribers:</strong> If this is your first Premium subscription and you request a refund within 7 days of your initial charge, you may be eligible for a full refund (see details below).</li>
                  <li><strong>Service outages:</strong> If Magic Mail experiences an extended service outage (more than 72 consecutive hours) that materially prevents you from using core features, you may request a prorated refund for the downtime period.</li>
                  <li><strong>Billing errors:</strong> If you were incorrectly charged due to a system error, we will refund the erroneous charge in full.</li>
                  <li><strong>Duplicate payments:</strong> If you were accidentally charged twice for the same billing period, we will refund the duplicate charge immediately.</li>
                </ul>
              </section>

              <section id="monthly-subscription" className="refund-section">
                <h2 className="refund-section__title">4. Monthly Subscriptions</h2>
                <p>
                  For monthly subscription plans, the following refund rules apply:
                </p>
                <ul className="refund-section__list">
                  <li><strong>First 7 days:</strong> If you are a first-time subscriber and cancel within 7 days of your initial monthly charge, you are eligible for a full refund of that month&apos;s payment.</li>
                  <li><strong>After 7 days:</strong> No refunds will be issued for the current month&apos;s billing period. However, you may cancel at any time to prevent future charges.</li>
                  <li><strong>Subsequent renewals:</strong> Automatic monthly renewals are non-refundable unless requested within 48 hours of the charge and you have not used any Premium features during that renewal period.</li>
                </ul>
                <div className="refund-section__example">
                  <p className="refund-section__example-title">Example:</p>
                  <p>You sign up for a monthly plan on January 15th and are charged $9.99. If you cancel on January 20th (within 7 days), you receive a full refund. If you cancel on January 25th (after 7 days), you keep access until February 14th but receive no refund for January.</p>
                </div>
              </section>

              <section id="annual-subscription" className="refund-section">
                <h2 className="refund-section__title">5. Annual Subscriptions</h2>
                <p>
                  Annual subscription plans offer better value but involve a larger upfront payment. 
                  Our refund policy for annual plans is designed to be fair to both you and us:
                </p>
                <ul className="refund-section__list">
                  <li><strong>First 30 days:</strong> If you are a first-time annual subscriber and request a refund within 30 days of your initial charge, you will receive a full refund (minus any usage fees if you processed more than 5,000 emails during that period).</li>
                  <li><strong>Days 31–90:</strong> If you cancel during this period, you will receive a prorated refund for the unused full months remaining in your annual term, less a $10 administrative fee.</li>
                  <li><strong>After 90 days:</strong> No refunds will be issued for annual subscriptions after the first 90 days. However, you will retain access to Premium features for the remainder of your paid term.</li>
                  <li><strong>Annual renewals:</strong> Automatic annual renewals may be refunded in full if requested within 14 days of the renewal charge and you have not used any Premium features during that renewal period.</li>
                </ul>
                <div className="refund-section__example">
                  <p className="refund-section__example-title">Example (Prorated Refund):</p>
                  <p>You purchase an annual plan for $99.00 on January 1st. You cancel on March 1st (60 days used, 305 days remaining). Refund = ($99.00 ÷ 365 days) × 305 days = $82.73, minus $10 fee = $72.73.</p>
                </div>
              </section>

              <section id="service-issues" className="refund-section">
                <h2 className="refund-section__title">6. Service Issues &amp; Downtime</h2>
                <p>
                  While we strive for 99.9% uptime, occasional service interruptions may occur. 
                  If you experience issues that materially impact your use of Magic Mail:
                </p>
                <ul className="refund-section__list">
                  <li>Please contact our support team at <a href="mailto:support@mymagicmail.app">support@mymagicmail.app</a> so we can resolve the issue.</li>
                  <li>If the issue persists for more than 72 consecutive hours, you may request a prorated refund for the downtime period.</li>
                  <li>Refunds for service issues are calculated as (Monthly Fee ÷ 30 days) × number of full days of downtime.</li>
                  <li>Scheduled maintenance (announced at least 24 hours in advance) does not qualify for refunds.</li>
                  <li>Issues caused by Google&apos;s Gmail API outages or your own internet connectivity do not qualify for refunds.</li>
                </ul>
              </section>

              <section id="cancellation" className="refund-section">
                <h2 className="refund-section__title">7. How to Cancel</h2>
                <p>
                  You may cancel your Magic Mail subscription at any time through:
                </p>
                <ul className="refund-section__list">
                  <li><strong>Account Settings:</strong> Navigate to Settings → Subscription → Cancel Subscription</li>
                  <li><strong>Email Request:</strong> Send a cancellation request to <a href="mailto:billing@mymagicmail.app">billing@mymagicmail.app</a> from your registered email address</li>
                </ul>
                <p>
                  <strong>Important:</strong> Cancellation takes effect at the end of your current billing period. 
                  You will not receive a refund for the current period unless you qualify under the exceptions above. 
                  You will retain access to Premium features until the end of your paid term.
                </p>
                <p className="refund-section__warning">
                  ⚠️ Canceling your subscription does not automatically delete your data. 
                  To delete your account and all associated data, please contact support or use the 
                  &quot;Delete Account&quot; option in Settings.
                </p>
              </section>

              <section id="refund-process" className="refund-section">
                <h2 className="refund-section__title">8. Refund Process</h2>
                <p>
                  To request a refund, please follow these steps:
                </p>
                <ol className="refund-section__ordered-list">
                  <li>Ensure you meet the eligibility criteria outlined above</li>
                  <li>Email our billing team at <a href="mailto:billing@mymagicmail.app">billing@mymagicmail.app</a> with the subject line &quot;Refund Request&quot;</li>
                  <li>Include your account email address and the reason for your refund request</li>
                  <li>If applicable, provide any relevant details about service issues or errors</li>
                </ol>
                <p>
                  Our team will review your request within 3–5 business days. If approved:
                </p>
                <ul className="refund-section__list">
                  <li>Refunds will be issued to the original payment method</li>
                  <li>Credit card refunds typically appear within 5–10 business days</li>
                  <li>PayPal refunds typically appear within 1–3 business days</li>
                  <li>You will receive a confirmation email once the refund is processed</li>
                </ul>
              </section>

              <section id="non-refundable" className="refund-section">
                <h2 className="refund-section__title">9. Non-Refundable Items</h2>
                <p>
                  The following items are non-refundable under any circumstances:
                </p>
                <ul className="refund-section__list">
                  <li>Subscription fees for billing periods that have already ended</li>
                  <li>Partial month or partial year refunds beyond the prorated calculation described above</li>
                  <li>Fees paid through third-party marketplaces (e.g., Apple App Store, Google Play) — please contact those platforms directly</li>
                  <li>Custom enterprise plans or negotiated contracts (refund terms will be specified in your agreement)</li>
                  <li>Add-on services or one-time setup fees</li>
                  <li>Any subscription where the user has violated our Terms of Service</li>
                </ul>
              </section>

              <section id="chargebacks" className="refund-section">
                <h2 className="refund-section__title">10. Chargebacks</h2>
                <p>
                  If you dispute a charge with your bank or credit card company (a &quot;chargeback&quot;) instead of 
                  contacting us first for a refund, we take this very seriously. A chargeback is often 
                  unnecessary and can be avoided by simply emailing our support team.
                </p>
                <p>
                  If you initiate a chargeback:
                </p>
                <ul className="refund-section__list">
                  <li>Your Magic Mail account will be immediately suspended</li>
                  <li>You will forfeit any remaining subscription time</li>
                  <li>We may dispute the chargeback with evidence of your subscription agreement</li>
                  <li>If the chargeback is resolved in our favor, a $25 dispute fee may be charged to reactivate your account</li>
                </ul>
                <p>
                  <strong>We strongly encourage you to contact us first</strong> — we are reasonable people 
                  and want to find a fair solution.
                </p>
              </section>

              <section id="changes" className="refund-section">
                <h2 className="refund-section__title">11. Changes to This Policy</h2>
                <p>
                  We reserve the right to modify this Refund Policy at any time. Changes become effective 
                  immediately upon posting. For active subscribers, material changes that reduce your 
                  refund rights will not apply retroactively to payments already made. We will notify 
                  you of material changes via email or through a notice in the Service.
                </p>
                <p>
                  The &quot;Effective Date&quot; at the top of this page indicates when this policy was last revised.
                </p>
              </section>

              <section id="contact" className="refund-section">
                <h2 className="refund-section__title">12. Contact Us</h2>
                <p>
                  If you have any questions about this Refund Policy or need assistance with a refund request, 
                  please contact us:
                </p>
                <div className="refund-section__contact">
                  <p><strong>Billing Support:</strong> <a href="mailto:billing@mymagicmail.app">billing@mymagicmail.app</a></p>
                  <p><strong>General Support:</strong> <a href="mailto:support@mymagicmail.app">support@mymagicmail.app</a></p>
                  <p><strong>Website:</strong> <a href="https://mymagicmail.app" target="_blank" rel="noopener noreferrer">mymagicmail.app</a></p>
                  <p><strong>Mail:</strong> Magic Mail Billing Dept., 48 Independence Avenue, Ridge, Accra, GA-345-6789, Ghana</p>
                </div>
                <p className="refund-section__disclaimer">
                  <strong>Note for EU customers:</strong> Under EU consumer law, you have the right to withdraw from a digital service purchase within 14 days without giving a reason. However, by using Premium features during the withdrawal period, you acknowledge that you waive this right to the extent you have already received the service.
                </p>
              </section>
            </div>
          </div>

          <div className="refund-card__footer">
            <p>© {currentYear} Magic Mail. All rights reserved.</p>
            <p>
              <Link href="/privacy" className="refund-card__footer-link">Privacy Policy</Link> | 
              <Link href="/terms" className="refund-card__footer-link">Terms of Service</Link> | 
              <Link href="/refund-policy" className="refund-card__footer-link">Refund Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}