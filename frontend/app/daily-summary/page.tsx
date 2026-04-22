'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface Citation {
  id: number
  emailId: string
  subject: string
  sender: string
  preview: string
  link: string
}

interface SummaryData {
  text: string
  citations: Citation[]
}

export default function DailySummaryPage() {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const summaryData: SummaryData = {
    text: "You received 47 emails in the last 24 hours[1]. Your inbox saw 23 promotional emails from various retailers[2], with 12 spam messages automatically filtered out[3]. Three priority emails require your attention: a contract review from legal department[4], an invoice payment reminder from finance[5], and an urgent client request[6]. Your Amazon order (#ORD-7842) has been shipped and will arrive Friday[7]. The team meeting scheduled for tomorrow has been moved to 3 PM[8]. Don't forget to review the monthly analytics report shared by marketing[9].",
    citations: [
      {
        id: 1,
        emailId: 'email_001',
        subject: 'Daily Email Summary',
        sender: 'notifications@magicmail.com',
        preview: 'You received 47 emails in the last 24 hours across all categories.',
        link: 'https://mail.google.com/mail/u/0/#inbox'
      },
      {
        id: 2,
        emailId: 'email_002',
        subject: 'Flash Sale: 50% Off Everything',
        sender: 'promotions@amazon.com',
        preview: 'Limited time offer! Get 50% off on all electronics. Use code FLASH50.',
        link: 'https://mail.google.com/mail/u/0/#promotions'
      },
      {
        id: 3,
        emailId: 'email_003',
        subject: 'Weekly Newsletter',
        sender: 'newsletter@techcrunch.com',
        preview: 'Top stories this week: AI breakthroughs, new product launches, and industry trends.',
        link: 'https://mail.google.com/mail/u/0/#spam'
      },
      {
        id: 4,
        emailId: 'email_004',
        subject: 'Urgent: Contract Review Needed',
        sender: 'legal@company.com',
        preview: 'Please review the attached contract for the new partnership agreement. Deadline: Friday.',
        link: 'https://mail.google.com/mail/u/0/#inbox'
      },
      {
        id: 5,
        emailId: 'email_005',
        subject: 'Invoice #INV-2024-001 - Payment Due',
        sender: 'finance@company.com',
        preview: 'Your invoice for $2,500 is due by March 15th. Please process payment at your earliest convenience.',
        link: 'https://mail.google.com/mail/u/0/#inbox'
      },
      {
        id: 6,
        emailId: 'email_006',
        subject: 'Client Request: Project Timeline Update',
        sender: 'client@acme.com',
        preview: 'Urgent: Need to discuss timeline adjustments for the Q2 deliverables.',
        link: 'https://mail.google.com/mail/u/0/#inbox'
      },
      {
        id: 7,
        emailId: 'email_007',
        subject: 'Your Amazon Order Has Shipped',
        sender: 'shipment@amazon.com',
        preview: 'Order #ORD-7842 has been shipped and will arrive by Friday, March 10th.',
        link: 'https://mail.google.com/mail/u/0/#inbox'
      },
      {
        id: 8,
        emailId: 'email_008',
        subject: 'Meeting Rescheduled: Team Sync',
        sender: 'calendar@company.com',
        preview: 'The team meeting originally scheduled for 2 PM has been moved to 3 PM today.',
        link: 'https://mail.google.com/mail/u/0/#inbox'
      },
      {
        id: 9,
        emailId: 'email_009',
        subject: 'Monthly Analytics Report - February',
        sender: 'analytics@company.com',
        preview: 'Q1 performance metrics are in. View the attached report for detailed insights.',
        link: 'https://mail.google.com/mail/u/0/#inbox'
      }
    ]
  }

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation)
    setIsModalOpen(true)
  }

  const handleOpenEmail = (link: string) => {
    window.open(link, '_blank')
  }

  const parseSummaryWithCitations = (text: string, citations: Citation[]) => {
    const parts = []
    let lastIndex = 0
    const regex = /\[(\d+)\]/g
    let match

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        })
      }
      
      const citationId = parseInt(match[1])
      const citation = citations.find(c => c.id === citationId)
      
      if (citation) {
        parts.push({
          type: 'citation',
          content: match[0],
          citation: citation
        })
      }
      
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      })
    }

    return parts
  }

  const summaryParts = parseSummaryWithCitations(summaryData.text, summaryData.citations)

  return (
    <main className="ds-page">
      <div className="ds-page__container">
        <div className="ds-header">
          <div className="ds-header__content">
            <div className="ds-header__icon">
              <Image src="/icons/sifted.png" alt="Summary" width={40} height={40} />
            </div>
            <h1 className="ds-header__title">Daily Summary</h1>
            <p className="ds-header__subtitle">
              AI-generated digest of your email activity in the last 24 hours
            </p>
            <div className="ds-header__date">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-card__gradient-border"></div>
          <div className="ds-card__inner">
            <div className="ds-card__header">
              <div className="ds-card__badge">AI Generated</div>
              <div className="ds-card__stats">
                <div className="ds-card__stat">
                  <span className="ds-card__stat-number">47</span>
                  <span className="ds-card__stat-label">Emails Received</span>
                </div>
                <div className="ds-card__stat">
                  <span className="ds-card__stat-number">3</span>
                  <span className="ds-card__stat-label">Priority Items</span>
                </div>
              </div>
            </div>
            <div className="ds-card__content">
              <div className="ds-summary-text">
                {summaryParts.map((part, index) => {
                  if (part.type === 'text') {
                    return <span key={index}>{part.content}</span>
                  } else {
                    return (
                      <button
                        key={index}
                        className="ds-citation-button"
                        onClick={() => handleCitationClick(part.citation!)}
                      >
                        {part.content}
                      </button>
                    )
                  }
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="ds-info">
          <div className="ds-info-card">
            <div className="ds-info-card__icon">🤖</div>
            <h3 className="ds-info-card__title">AI-Powered Analysis</h3>
            <p className="ds-info-card__description">
              Our AI scans and summarizes your emails, highlighting what matters most
            </p>
          </div>
          <div className="ds-info-card">
            <div className="ds-info-card__icon">📊</div>
            <h3 className="ds-info-card__title">Smart Citations</h3>
            <p className="ds-info-card__description">
              Click on citation numbers to preview the original email content
            </p>
          </div>
          <div className="ds-info-card">
            <div className="ds-info-card__icon">⚡</div>
            <h3 className="ds-info-card__title">Quick Actions</h3>
            <p className="ds-info-card__description">
              Open emails directly from citations to take immediate action
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && selectedCitation && (
        <div className="ds-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="ds-email-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ds-email-modal__header">
              <h2 className="ds-email-modal__title">Email Details</h2>
              <button 
                className="ds-email-modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="ds-email-modal__content">
              <div className="ds-email-field">
                <label className="ds-email-field__label">Subject</label>
                <p className="ds-email-field__value">{selectedCitation.subject}</p>
              </div>
              <div className="ds-email-field">
                <label className="ds-email-field__label">From</label>
                <p className="ds-email-field__value">{selectedCitation.sender}</p>
              </div>
              <div className="ds-email-field">
                <label className="ds-email-field__label">Preview</label>
                <p className="ds-email-field__value ds-email-field__value--preview">
                  {selectedCitation.preview}
                </p>
              </div>
            </div>
            <div className="ds-email-modal__footer">
              <button 
                className="ds-email-modal__cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              <button 
                className="ds-email-modal__open-btn"
                onClick={() => handleOpenEmail(selectedCitation.link)}
              >
                Open in Email
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}