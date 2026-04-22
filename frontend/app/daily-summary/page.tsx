'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'

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
  emailsReceived: number
  priorityItems: number
  citations: Citation[]
}

export default function DailySummaryPage() {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const token = useAppSelector(selectAuthToken)
  const backendBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000',
    []
  )
  const [summaryData, setSummaryData] = useState<SummaryData>({
    text: '',
    emailsReceived: 0,
    priorityItems: 0,
    citations: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSummary = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }

        let response = await fetch(`${backendBaseUrl}/daily-summary/latest`, { headers })

        if (response.status === 404) {
          await fetch(`${backendBaseUrl}/daily-summary/regenerate`, {
            method: 'POST',
            headers,
          })
          response = await fetch(`${backendBaseUrl}/daily-summary/latest`, { headers })
        }

        if (!response.ok) {
          throw new Error(`Failed to load daily summary (${response.status})`)
        }

        const data = (await response.json()) as {
          ok: boolean
          summary: SummaryData
        }

        setSummaryData(data.summary)
      } catch (error) {
        console.error('Daily summary fetch failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSummary()
  }, [backendBaseUrl, token])

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
                  <span className="ds-card__stat-number">{summaryData.emailsReceived}</span>
                  <span className="ds-card__stat-label">Emails Received</span>
                </div>
                <div className="ds-card__stat">
                  <span className="ds-card__stat-number">{summaryData.priorityItems}</span>
                  <span className="ds-card__stat-label">Priority Items</span>
                </div>
              </div>
            </div>
            <div className="ds-card__content">
              <div className="ds-summary-text">
                {isLoading && <span>Generating your daily summary...</span>}
                {!isLoading && !summaryData.text && <span>No daily summary available yet.</span>}
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