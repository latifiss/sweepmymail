'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'
import PricingPopup from '@/components/pricingPopup'

interface Category {
  id: string
  label: string
  description: string
  createdAt: string
  emailCount: number
}

type ApiErrorResponse = {
  ok?: boolean
  error?: string
}

export default function CategorizationPage() {
  const token = useAppSelector(selectAuthToken)
  const backendBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || ' ',
    []
  )
  const [categories, setCategories] = useState<Category[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    label: '',
    description: ''
  })

  const showFriendlyError = (message: string) => {
    setErrorMessage(message)
    setIsErrorModalOpen(true)
  }

  const parseCategoryCreateError = (rawMessage: string) => {
    const message = rawMessage.toLowerCase()
    if (message.includes('duplicate')) {
      return 'This category already exists. Please use a different name.'
    }
    if (message.includes('invalid authentication credentials')) {
      return 'Your Google session expired. Please sign in with Google again, then retry.'
    }
    if (message.includes('limit reached')) {
      if (message.includes('free tier')) {
        setIsPricingOpen(true)
      }
      return 'You’ve reached the Free tier limit for categories. Upgrade to create more.'
    }
    return 'Could not create this category right now. Please try again.'
  }

  const loadCategories = useCallback(async () => {
    if (!token) return
    const response = await fetch(`${backendBaseUrl}/emails/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to load categories (${response.status})`)
    }

    const data = (await response.json()) as {
      ok: boolean
      categories: Array<{
        id: string
        label: string
        description: string
        created_at: string
        email_count: number
      }>
    }

    setCategories(
      (data.categories || []).map((cat) => ({
        id: cat.id,
        label: cat.label,
        description: cat.description,
        createdAt: (cat.created_at || '').split('T')[0] || '',
        emailCount: cat.email_count || 0,
      }))
    )
  }, [backendBaseUrl, token])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCategories().catch((error) => {
        console.error('Failed to load categories:', error)
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadCategories])

  const handleCreateCategory = () => {
    if (!newCategory.label.trim() || !token) return

    const create = async () => {
      const response = await fetch(`${backendBaseUrl}/emails/categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: newCategory.label,
          description: newCategory.description,
        }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse
        throw new Error(payload.error || `Failed to create category (${response.status})`)
      }

      await loadCategories()
      setNewCategory({ label: '', description: '' })
      setIsModalOpen(false)
    }

    create().catch((error) => {
      console.error('Failed to create category:', error)
      showFriendlyError(parseCategoryCreateError(error?.message || 'Unknown error'))
    })
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedCategory || !token) return

    const remove = async () => {
      const response = await fetch(`${backendBaseUrl}/emails/categories/${selectedCategory.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to delete category (${response.status})`)
      }

      await loadCategories()
      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
    }

    remove().catch((error) => {
      console.error('Failed to delete category:', error)
    })
  }

  return (
    <main className="cat-page">
      <div className="cat-page__container">
        <div className="cat-header">
          <div className="cat-header__content">
            <h1 className="cat-header__title">Categories</h1>
            <p className="cat-header__subtitle">
              Organize your emails with custom categories
            </p>
            <button 
              className="cat-header__create-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="cat-header__create-btn__content">
                <span>+ Create Category</span>
              </div>
            </button>
          </div>
        </div>

        <div className="cat-grid">
          {categories.map((category) => (
            <div key={category.id} className="cat-card">
              <div className="cat-card__header">
                <div className="cat-card__icon">
                  <Image src="/logos/logo.png" alt="Category" width={24} height={24} />
                </div>
                <button 
                  className="cat-card__delete"
                  onClick={() => handleDeleteClick(category)}
                >
                  <span>×</span>
                </button>
              </div>
              <div className="cat-card__content">
                <h3 className="cat-card__label">{category.label}</h3>
                <p className="cat-card__description">{category.description}</p>
                <div className="cat-card__stats">
                  <div className="cat-card__stat">
                    <span className="cat-card__stat-number">{category.emailCount}</span>
                    <span className="cat-card__stat-label">emails</span>
                  </div>
                  <div className="cat-card__stat">
                    <span className="cat-card__stat-label">Created</span>
                    <span className="cat-card__stat-date">{category.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="cat-empty-state">
            <div className="cat-empty-state__content">
              <div className="cat-empty-state__icon">📁</div>
              <h3 className="cat-empty-state__title">No categories yet</h3>
              <p className="cat-empty-state__description">
                Create your first category to start organizing your emails
              </p>
              <button 
                className="cat-empty-state__btn"
                onClick={() => setIsModalOpen(true)}
              >
                Create Category
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="cat-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal__header">
              <h2 className="cat-modal__title">Create New Category</h2>
              <button 
                className="cat-modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="cat-modal__content">
              <div className="cat-modal-field">
                <label className="cat-modal-field__label">Category Label</label>
                <input 
                  type="text" 
                  className="cat-modal-field__input"
                  placeholder="e.g., Work, Personal, Shopping"
                  value={newCategory.label}
                  onChange={(e) => setNewCategory({...newCategory, label: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="cat-modal-field">
                <label className="cat-modal-field__label">Category Description</label>
                <textarea 
                  className="cat-modal-field__textarea"
                  placeholder="Describe what kind of emails belong here"
                  rows={4}
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                />
              </div>
            </div>
            <div className="cat-modal__footer">
              <button 
                className="cat-modal__cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="cat-modal__create-btn"
                onClick={handleCreateCategory}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedCategory && (
        <div className="cat-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="cat-modal cat-modal--warning" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal__header cat-modal__header--warning">
              <h2 className="cat-modal__title">Delete Category</h2>
              <button 
                className="cat-modal__close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="cat-modal__content">
              <div className="cat-warning-icon">⚠️</div>
              <p className="cat-warning-text">
                Are you sure you want to delete the category <strong>&quot;{selectedCategory.label}&quot;</strong>?
              </p>
              <p className="cat-warning-subtext">
                This action cannot be undone. Emails in this category will need to be re-categorized.
              </p>
            </div>
            <div className="cat-modal__footer">
              <button 
                className="cat-modal__cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="cat-modal__delete-btn"
                onClick={handleConfirmDelete}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="cat-modal-overlay" onClick={() => setIsErrorModalOpen(false)}>
          <div className="cat-modal cat-modal--warning" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal__header cat-modal__header--warning">
              <h2 className="cat-modal__title">Could not create category</h2>
              <button className="cat-modal__close" onClick={() => setIsErrorModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="cat-modal__content">
              <p className="cat-warning-text">{errorMessage}</p>
            </div>
            <div className="cat-modal__footer">
              <button className="cat-modal__create-btn" onClick={() => setIsErrorModalOpen(false)}>
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