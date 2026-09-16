'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBetterAuthSession } from '@/lib/auth-session'

export default function GoogleLoginCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      setErrorMessage('Google sign-in was cancelled or failed. Please try again.')
      return
    }

    getBetterAuthSession().then((session) => {
      if (session) {
        router.replace('/')
      } else {
        setErrorMessage('Unable to verify your login session. Please try again.')
      }
    })
  }, [router, searchParams])

  if (errorMessage) {
    return (
      <main className="login-page">
        <div className="login-page__container">
          <div className="login-card">
            <div className="login-card__content">
              <p>{errorMessage}</p>
              <button className="login-card__google-btn" onClick={() => router.replace('/login')}>
                Back to login
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="login-page">
      <div className="login-page__container">
        <div className="login-card">
          <div className="login-card__content">
            <p>Completing Google login...</p>
          </div>
        </div>
      </div>
    </main>
  )
}
