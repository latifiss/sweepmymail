'use client'

import React, { useEffect, useState } from 'react'

interface LoadingModalProps {
  isOpen: boolean
  message?: string
  color?: string 
}

export default function LoadingModal({ 
  isOpen, 
  message = 'Loading...', 
  color = '#0066cc' 
}: LoadingModalProps) {
  const [isVisible, setIsVisible] = useState(() => isOpen)

  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden'
        
      const openTimer = window.setTimeout(() => setIsVisible(true), 0)
      return () => window.clearTimeout(openTimer)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
        document.body.style.overflow = ''
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!isVisible && !isOpen) return null

  const customStyle = {
    '--loading-color': color,
    '--shadow-color': color,
  } as React.CSSProperties

  return (
    <div 
      className={`loading-modal-overlay ${isOpen ? 'loading-modal-overlay--open' : ''}`}
      style={customStyle}
    >
      <div className="loading-modal">
        <div className="loading-modal__content">
          <div className="loading-animation">
            <div className="loading-animation__square">
              <div className="loading-animation__snake"></div>
            </div>
          </div>
          {message && <p className="loading-modal__message">{message}</p>}
        </div>
      </div>
    </div>
  )
}