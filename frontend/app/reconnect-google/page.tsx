'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBetterAuthSession } from '@/lib/auth-session'

const backendBaseUrl = () =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000'

export default function ReconnectGooglePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Checking your Google connection...')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkConnection = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${backendBaseUrl()}/auth/google/status`, {
        credentials: 'include',
        cache: 'no-store',
      })

      const data = await response.json()

      if (response.ok && data?.connected) {
        setMessage('Google is connected and Gmail access is working.')
        return true
      }

      if (data?.requiresReauthorization) {
        setMessage('Your Google authorization needs to be renewed.')
        return false
      }

      throw new Error(data?.message || 'Unable to verify Gmail access')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify Gmail access')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const success = searchParams.get('success')

    if (success === '1') {
      void checkConnection()
      return
    }

    getBetterAuthSession().then((session) => {
      if (!session) {
        router.replace('/login')
        return
      }

      void checkConnection()
    })
  }, [checkConnection, router, searchParams])

  const handleReconnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${backendBaseUrl()}/auth/google/reconnect`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok || !data?.url) {
        throw new Error(
          data?.message || data?.error || 'Unable to start Google reauthorization'
        )
      }

      window.location.href = data.url
    } catch (err) {
      setLoading(false)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start Google reauthorization'
      )
    }
  }

  const isConnected =
    message === 'Google is connected and Gmail access is working.'

  return (
    <main className="login-page">
      <div className="login-page__container">
        <div className="login-card">
          <div className="login-card__content">
            <h1 className="login-card__title">
              {isConnected ? 'Google connected' : 'Reconnect Google'}
            </h1>

            <p className="login-card__subtitle">
              {isConnected
                ? 'Your Gmail connection is ready for automations.'
                : 'Your Gmail authorization has expired or been revoked. Reconnect your Google account to restore Gmail access.'}
            </p>

            {error && <p role="alert">{error}</p>}

            {!isConnected && (
              <button
                className="login-card__google-btn"
                onClick={handleReconnect}
                disabled={loading}
              >
                <div className="login-card__google-btn__content">
                  <span>
                    {loading ? 'Connecting...' : 'Reconnect with Google'}
                  </span>
                </div>
              </button>
            )}

            {isConnected && (
              <button
                className="login-card__google-btn"
                onClick={() => router.replace('/')}
              >
                <div className="login-card__google-btn__content">
                  <span>Back to Magic Mail</span>
                </div>
              </button>
            )}

            {!isConnected && message && !error && (
              <p className="login-card__note">{message}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
