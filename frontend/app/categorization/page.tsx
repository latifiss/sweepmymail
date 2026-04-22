'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface Category {
  id: string
  label: string
  description: string
  createdAt: string
  emailCount: number
}

export default function CategorizationPage() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      label: 'Primary',
      description: 'Important personal and work-related emails',
      createdAt: '2024-01-15',
      emailCount: 1247
    },
    {
      id: '2',
      label: 'Social',
      description: 'Social media notifications and updates',
      createdAt: '2024-01-15',
      emailCount: 342
    },
    {
      id: '3',
      label: 'Promotions',
      description: 'Marketing emails and special offers',
      createdAt: '2024-01-15',
      emailCount: 892
    },
    {
      id: '4',
      label: 'Updates',
      description: 'App notifications and system updates',
      createdAt: '2024-01-15',
      emailCount: 156
    }
  ])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    label: '',
    description: ''
  })

  const handleCreateCategory = () => {
    if (!newCategory.label.trim()) return
    
    const category: Category = {
      id: Date.now().toString(),
      label: newCategory.label,
      description: newCategory.description || 'No description provided',
      createdAt: new Date().toISOString().split('T')[0],
      emailCount: 0
    }
    
    setCategories([...categories, category])
    setNewCategory({ label: '', description: '' })
    setIsModalOpen(false)
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id))
      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
    }
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
                  <Image src="/icons/sifted.png" alt="Category" width={24} height={24} />
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

      {/* Create Category Modal */}
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

      {/* Delete Confirmation Modal */}
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
                Are you sure you want to delete the category <strong>"{selectedCategory.label}"</strong>?
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
    </main>
  )
}