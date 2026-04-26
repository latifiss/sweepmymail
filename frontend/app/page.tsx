'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'

export default function Home() {
  const router = useRouter()
  const token = useAppSelector(selectAuthToken)

  useEffect(() => {
    if (token) {
      router.replace('/subscriptions')
      return
    }
    router.replace('/scroll')
  }, [router, token])

  return null
}
