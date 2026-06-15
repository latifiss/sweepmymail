'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'
import HomePage from './client'

export default function Home() {
  const router = useRouter()
  const token = useAppSelector(selectAuthToken)

  useEffect(() => {
    if (token) {
      router.replace('/subscriptions')
    }
  }, [router, token])

  if (!token) {
    return <HomePage />
  }

  return null
}
