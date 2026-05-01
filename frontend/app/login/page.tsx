'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleLogin = async () => {
    try {
      const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' '
      const response = await fetch(`${backendBaseUrl}/auth/google/url`)

      if (!response.ok) {
        throw new Error('Failed to fetch Google auth URL')
      }

      const data = await response.json()
      if (!data?.url) {
        throw new Error('Backend did not return a Google auth URL')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Google login initialization failed:', error)
      router.push('/login/callback?error=google_login_init_failed')
    }
  }

  return (
    <main className="login-page">
      <div className="login-page__background">
      </div>
      
      <div className="login-page__container">
        <div className="login-card">
          <div className="login-card__header">
            <div className="login-card__logo-wrapper">
              <div className="login-card__logo">
                <Image 
                  src="/logos/logo.png" 
                  alt="Magic Mail" 
                  width={64} 
                  height={64}
                />
              </div>
            </div>
            <h1 className="login-card__title">
              Magic Mail
            </h1>
            <p className="login-card__subtitle">
              Clean inbox. Clear mind.
            </p>
          </div>

          <div className="login-card__content">
            <button 
              className="login-card__google-btn"
              onClick={handleGoogleLogin}
            >
              <div className="login-card__google-btn__content">
                <Image 
                  src="/icons/google.svg" 
                  alt="Google" 
                  width={20} 
                  height={20}
                />
                <span>Continue with Google</span>
              </div>
            </button>

            <div className="login-card__divider">
              <span>Secure Login</span>
            </div>

            <p className="login-card__note">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          <div className="login-card__footer">
            <p>No credit card required • Free up to 100 emails</p>
          </div>
        </div>
      </div>
    </main>
  )
}