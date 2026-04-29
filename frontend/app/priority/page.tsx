'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'
import PricingPopup from '@/components/pricingPopup'

interface PriorityWord {
  id: string
  word: string
  createdAt: string
}

type ApiErrorResponse = {
  ok?: boolean
  error?: string
}

export default function HighPriorityPage() {
  const token = useAppSelector(selectAuthToken)
  const backendBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000',
    []
  )
  const [priorityWords, setPriorityWords] = useState<PriorityWord[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedWord, setSelectedWord] = useState<PriorityWord | null>(null)
  const [newWord, setNewWord] = useState('')

  const showFriendlyError = (message: string) => {
    setErrorMessage(message)
    setIsErrorModalOpen(true)
  }

  const parsePriorityCreateError = (rawMessage: string) => {
    const message = rawMessage.toLowerCase()
    if (message.includes('priority_keywords_user_word_unique') || message.includes('duplicate')) {
      return 'You already added this keyword. Try a different one.'
    }
    if (message.includes('invalid authentication credentials')) {
      return 'Your Google session expired. Please sign in with Google again, then retry.'
    }
    if (message.includes('limit reached')) {
      if (message.includes('free tier')) {
        setIsPricingOpen(true)
      }
      return 'You’ve reached the Free tier limit for priority keywords. Upgrade to add more.'
    }
    return 'Could not add this keyword right now. Please try again.'
  }

  const loadKeywords = useCallback(async () => {
    if (!token) return
    const response = await fetch(`${backendBaseUrl}/emails/priority-keywords`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to load priority keywords (${response.status})`)
    }

    const data = (await response.json()) as {
      ok: boolean
      keywords: Array<{
        id: string
        word: string
        created_at: string
      }>
    }

    setPriorityWords(
      (data.keywords || []).map((item) => ({
        id: item.id,
        word: item.word,
        createdAt: (item.created_at || '').split('T')[0] || '',
      }))
    )
  }, [backendBaseUrl, token])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadKeywords().catch((error) => {
        console.error('Failed to load priority keywords:', error)
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadKeywords])

  const handleAddWord = () => {
    if (!newWord.trim() || !token) return
    
    const existingWord = priorityWords.find(
      w => w.word.toLowerCase() === newWord.trim().toLowerCase()
    )
    
    if (existingWord) {
      showFriendlyError('You already added this keyword. Try a different one.')
      return
    }
    
    const add = async () => {
      const response = await fetch(`${backendBaseUrl}/emails/priority-keywords`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: newWord.trim() }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse
        throw new Error(payload.error || `Failed to create priority keyword (${response.status})`)
      }

      await loadKeywords()
      setNewWord('')
      setIsModalOpen(false)
    }

    add().catch((error) => {
      console.error('Failed to add priority keyword:', error)
      showFriendlyError(parsePriorityCreateError(error?.message || 'Unknown error'))
    })
  }

  const handleDeleteClick = (word: PriorityWord) => {
    setSelectedWord(word)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedWord || !token) return

    const remove = async () => {
      const response = await fetch(`${backendBaseUrl}/emails/priority-keywords/${selectedWord.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to delete priority keyword (${response.status})`)
      }

      await loadKeywords()
      setIsDeleteModalOpen(false)
      setSelectedWord(null)
    }

    remove().catch((error) => {
      console.error('Failed to remove priority keyword:', error)
    })
  }

  return (
    <main className="high-priority-page">
      <div className="high-priority-page__container">
        <div className="priority-header">
          <div className="priority-header__content">
            <div className="priority-header__icon">
              <Image src="/icons/sifted.png" alt="Priority" width={40} height={40} />
            </div>
            <h1 className="priority-header__title">High Priority</h1>
            <p className="priority-header__subtitle">
              Emails containing these keywords will be marked as high priority
            </p>
            <button 
              className="priority-header__create-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="priority-header__create-btn__content">
                <span>+ Add Keyword</span>
              </div>
            </button>
          </div>
        </div>

        <div className="priority-stats">
          <div className="stat-card">
            <div className="stat-card__number">{priorityWords.length}</div>
            <div className="stat-card__label">Priority Keywords</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__number">Active</div>
            <div className="stat-card__label">Auto-Marking</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__number">Real-time</div>
            <div className="stat-card__label">Scanning</div>
          </div>
        </div>

        <div className="priority-words-section">
          <h2 className="priority-words-section__title">Your Priority Keywords</h2>
          <p className="priority-words-section__description">
            Any email containing these words will be automatically marked as high priority
          </p>
          
          {priorityWords.length > 0 ? (
            <div className="priority-words-grid">
              {priorityWords.map((word) => (
                <div key={word.id} className="priority-word-card">
                  <div className="priority-word-card__content">
                    <div className="priority-word-card__icon">⭐</div>
                    <div className="priority-word-card__info">
                      <h3 className="priority-word-card__word">{word.word}</h3>
                      <p className="priority-word-card__date">Added on {word.createdAt}</p>
                    </div>
                  </div>
                  <button 
                    className="priority-word-card__delete"
                    onClick={() => handleDeleteClick(word)}
                  >
                    <span>×</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__content">
                <div className="empty-state__icon">🏷️</div>
                <h3 className="empty-state__title">No priority keywords yet</h3>
                <p className="empty-state__description">
                  Add keywords to automatically mark important emails as high priority
                </p>
                <button 
                  className="empty-state__btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Your First Keyword
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="priority-info">
          <div className="info-card">
            <div className="info-card__icon">⚡</div>
            <h3 className="info-card__title">Real-time Scanning</h3>
            <p className="info-card__description">
              New emails are scanned instantly for priority keywords
            </p>
          </div>
          <div className="info-card">
            <div className="info-card__icon">🎯</div>
            <h3 className="info-card__title">Case Insensitive</h3>
            <p className="info-card__description">
              Keywords work regardless of uppercase or lowercase
            </p>
          </div>
          <div className="info-card">
            <div className="info-card__icon">📧</div>
            <h3 className="info-card__title">Subject & Body</h3>
            <p className="info-card__description">
              Scans both email subject and content for keywords
            </p>
          </div>
        </div>
      </div>

      {/* Add Keyword Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Add Priority Keyword</h2>
              <button 
                className="modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__content">
              <div className="modal-field">
                <label className="modal-field__label">Keyword</label>
                <input 
                  type="text" 
                  className="modal-field__input"
                  placeholder="e.g., urgent, invoice, meeting"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  autoFocus
                />
                <p className="modal-field__hint">
                  Any email containing this word will be marked as high priority
                </p>
              </div>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="modal__create-btn"
                onClick={handleAddWord}
              >
                Add Keyword
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedWord && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal modal--warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header modal__header--warning">
              <h2 className="modal__title">Remove Keyword</h2>
              <button 
                className="modal__close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__content">
              <div className="warning-icon">⚠️</div>
              <p className="warning-text">
                Are you sure you want to remove the keyword <strong>&quot;{selectedWord.word}&quot;</strong>?
              </p>
              <p className="warning-subtext">
                Emails containing this word will no longer be automatically marked as high priority.
              </p>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="modal__delete-btn"
                onClick={handleConfirmDelete}
              >
                Remove Keyword
              </button>
            </div>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsErrorModalOpen(false)}>
          <div className="modal modal--warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header modal__header--warning">
              <h2 className="modal__title">Could not add keyword</h2>
              <button className="modal__close" onClick={() => setIsErrorModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal__content">
              <p className="warning-text">{errorMessage}</p>
            </div>
            <div className="modal__footer">
              <button className="modal__create-btn" onClick={() => setIsErrorModalOpen(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {isPricingOpen && <PricingPopup onClose={() => setIsPricingOpen(false)} />}
    </main>
  )
}