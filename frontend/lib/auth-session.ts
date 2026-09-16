const backendBaseUrl = () =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000'

export type BetterAuthSession = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  session: {
    id: string
    userId: string
    expiresAt: string
  }
}

export async function getBetterAuthSession(): Promise<BetterAuthSession | null> {
  try {
    const response = await fetch(`${backendBaseUrl()}/api/auth/get-session`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) return null

    const data = (await response.json()) as BetterAuthSession | null
    return data?.user && data?.session ? data : null
  } catch {
    return null
  }
}

export async function signOutBetterAuth(): Promise<void> {
  await fetch(`${backendBaseUrl()}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
