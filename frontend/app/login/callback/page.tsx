'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '@/store/features/auth/authSlice'

type BackendGoogleCallbackResponse = {
  token: string
  user: {
    id: string
    email: string
    name?: string
    picture?: string
  }
}

export default function GoogleLoginCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()

  const code = searchParams.get('code')
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const id = searchParams.get('id')
  const name = searchParams.get('name')
  const picture = searchParams.get('picture')
  const oauthError = searchParams.get('error')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const backendBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || ' ',
    []
  )

  useEffect(() => {
    const completeGoogleLogin = async () => {
      if (oauthError) {
        setErrorMessage('Google sign-in was cancelled or failed. Please try again.')
        return
      }

      if (!code) {
        if (token && email && id) {
          dispatch(
            loginSuccess({
              accessToken: token,
              refreshToken: '',
              user: {
                id,
                email,
                role: 'customer',
                name: name || undefined,
                picture: picture || undefined,
              },
            })
          )
          router.replace('/')
          return
        }

        setErrorMessage('Missing authorization code. Please try logging in again.')
        return
      }

      try {
        const response = await fetch(
          `${backendBaseUrl}/auth/google/callback?code=${encodeURIComponent(code)}`
        )

        const data = (await response.json()) as Partial<BackendGoogleCallbackResponse> & {
          error?: string
          message?: string
        }

        if (!response.ok || !data?.token || !data?.user?.email) {
          throw new Error(data?.message || data?.error || 'Google login failed')
        }

        dispatch(
          loginSuccess({
            accessToken: data.token,
            refreshToken: '',
            user: {
              id: data.user.id,
              email: data.user.email,
              role: 'customer',
              name: data.user.name,
              picture: data.user.picture,
            },
          })
        )

        router.replace('/')
      } catch (error) {
        console.error('Google callback handling failed:', error)
        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to complete Google login.'
        )
      }
    }

    completeGoogleLogin()
  }, [backendBaseUrl, code, dispatch, email, id, oauthError, router, token])

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
