'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface PriorityWord {
  id: string
  word: string
  createdAt: string
}

export default function HighPriorityPage() {
  const [priorityWords, setPriorityWords] = useState<PriorityWord[]>([
    { id: '1', word: 'urgent', createdAt: '2024-01-15' },
    { id: '2', word: 'invoice', createdAt: '2024-01-15' },
    { id: '3', word: 'contract', createdAt: '2024-01-15' },
    { id: '4', word: 'meeting', createdAt: '2024-01-15' },
    { id: '5', word: 'deadline', createdAt: '2024-01-15' }
  ])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState<PriorityWord | null>(null)
  const [newWord, setNewWord] = useState('')

  const handleAddWord = () => {
    if (!newWord.trim()) return
    
    const existingWord = priorityWords.find(
      w => w.word.toLowerCase() === newWord.trim().toLowerCase()
    )
    
    if (existingWord) {
      alert('This word already exists in your priority list')
      return
    }
    
    const word: PriorityWord = {
      id: Date.now().toString(),
      word: newWord.trim().toLowerCase(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    setPriorityWords([...priorityWords, word])
    setNewWord('')
    setIsModalOpen(false)
  }

  const handleDeleteClick = (word: PriorityWord) => {
    setSelectedWord(word)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedWord) {
      setPriorityWords(priorityWords.filter(w => w.id !== selectedWord.id))
      setIsDeleteModalOpen(false)
      setSelectedWord(null)
    }
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
                Are you sure you want to remove the keyword <strong>"{selectedWord.word}"</strong>?
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
    </main>
  )
}