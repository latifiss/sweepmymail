'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/app/hooks'
import { logout, selectAuthToken, selectCurrentUser } from '@/store/features/auth/authSlice'

type ProfileResponse = {
  id: string
  email: string
  name: string
  picture: string | null
  provider: 'google' | 'microsoft'
  createdAt: string
  emailsCleaned: number
}

type ProfileUiData = {
  name: string
  email: string
  plan: string
  subscriptionStatus: string
  credits: number
  emailsCleaned: number
  joinDate: string
  picture: string
}

type SubscriptionMeResponse = {
  ok: boolean
  subscription: {
    tier: 'starter' | 'growth' | 'pro'
    status: 'active' | 'inactive' | 'past_due' | 'canceled'
  }
  limits: {
    maxFetchPerSync: number
    maxDeleteBatch: number
    maxCategories: number
    maxPriorityKeywords: number
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const token = useAppSelector(selectAuthToken)
  const authUser = useAppSelector(selectCurrentUser)
  const backendBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000',
    []
  )
  const [userData, setUserData] = useState<ProfileUiData>({
    name: authUser?.email?.split('@')[0] || 'User',
    email: authUser?.email || '',
    plan: 'Starter',
    subscriptionStatus: 'inactive',
    credits: 0,
    emailsCleaned: 0,
    joinDate: '-',
    picture: authUser?.picture || ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return

      try {
        const response = await fetch(`${backendBaseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          // If the backend hasn't been restarted / endpoint isn't available yet, don't spam errors.
          if (response.status === 404) return
          throw new Error(`Profile fetch failed with status ${response.status}`)
        }

        const data = (await response.json()) as ProfileResponse
        const memberSince = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })
          : '-'

        setUserData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          emailsCleaned: data.emailsCleaned ?? prev.emailsCleaned,
          joinDate: memberSince,
          picture: data.picture || prev.picture,
        }))
      } catch (error) {
        console.error('Failed to load profile data:', error)
      }
    }

    fetchProfile()
  }, [backendBaseUrl, token])

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!token) {
        console.log('[Subscription Check] Skipped: missing auth token')
        return
      }

      try {
        console.log('[Subscription Check] Fetching /subscriptions/me...')
        const response = await fetch(`${backendBaseUrl}/subscriptions/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          console.log('[Subscription Check] Request failed', {
            status: response.status,
            statusText: response.statusText,
          })
          return
        }

        const data = (await response.json()) as SubscriptionMeResponse
        console.log('[Subscription Check] Success payload:', data)

        if (!data?.ok || !data.subscription || !data.limits) {
          console.log('[Subscription Check] Unexpected payload format:', data)
          return
        }

        setUserData((prev) => ({
          ...prev,
          plan: data.subscription.tier.toUpperCase(),
          subscriptionStatus: data.subscription.status,
          credits: data.limits.maxDeleteBatch,
        }))
      } catch (error) {
        console.error('[Subscription Check] Failed to fetch subscription:', error)
      }
    }

    fetchSubscription()
  }, [backendBaseUrl, token])

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleLogout = () => {
    dispatch(logout())
    router.replace('/scroll')
  }

  return (
    <main className="profile-page">
      <div className="profile-page__container">
        <div className="profile-header">
          <div className="profile-header__content">
            <div className="profile-header__avatar">
              <div className="profile-header__avatar-inner">
                <Image
                  src={userData.picture || "/assets/avatar.png"}
                  alt="Profile"
                  width={80}
                  height={80}
                />
              </div>
            </div>
            <h1 className="profile-header__name">{userData.name}</h1>
            <p className="profile-header__email">{userData.email}</p>
            <div className="profile-header__plan-badge">
              <span>{userData.plan}</span>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-card__number">{userData.emailsCleaned.toLocaleString()}</div>
            <div className="stat-card__label">Emails Cleaned</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__number">{userData.credits.toLocaleString()}</div>
            <div className="stat-card__label">Available Credits</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__number">{userData.joinDate}</div>
            <div className="stat-card__label">Member Since</div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <div className="profile-section__header">
              <h2 className="profile-section__head">Account Settings</h2>
              {!isEditing ? (
                <button 
                  className="profile-section__edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  className="profile-section__save-btn"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              )}
            </div>
            <div className="profile-section__content">
              <div className="profile-field">
                <label className="profile-field__label">Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="profile-field__input"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                  />
                ) : (
                  <p className="profile-field__value">{userData.name}</p>
                )}
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    className="profile-field__input"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                  />
                ) : (
                  <p className="profile-field__value">{userData.email}</p>
                )}
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Subscription Plan</label>
                {isEditing ? (
                  <select 
                    className="profile-field__select"
                    value={userData.plan}
                    onChange={(e) => setUserData({...userData, plan: e.target.value})}
                  >
                    <option>Free Plan</option>
                    <option>Pro Plan</option>
                    <option>Business Plan</option>
                  </select>
                ) : (
                  <p className="profile-field__value">{userData.plan}</p>
                )}
              </div>

              <div className="profile-field">
                <label className="profile-field__label">Subscription Status</label>
                <p className="profile-field__value">{userData.subscriptionStatus}</p>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section__title">Connected Accounts</h2>
            <div className="profile-section__content">
              <div className="connected-account">
                <div className="connected-account__info">
                  <div className="connected-account__icon">
                    <Image src="/icons/google.svg" alt="Google" width={24} height={24} />
                  </div>
                  <div className="connected-account__details">
                    <p className="connected-account__name">Google Account</p>
                                      <p className="connected-account__email">{userData.email}</p>
                                      <div className="connected-account__status connected-account__status--connected">
                  Connected
                </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section__title">Preferences</h2>
            <div className="profile-section__content">
              <div className="preference-item">
                <div className="preference-item__info">
                  <p className="preference-item__title">Email Summaries</p>
                  <p className="preference-item__description">Receive daily email digests</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-switch__slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-item__info">
                  <p className="preference-item__title">Priority Notifications</p>
                  <p className="preference-item__description">Get alerts for priority emails</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-switch__slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-item__info">
                  <p className="preference-item__title">Auto-Categorization</p>
                  <p className="preference-item__description">Automatically sort incoming emails</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-switch__slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="profile-section profile-section--danger">
            <h2 className="profile-section__title">Danger Zone</h2>
            <div className="profile-section__content">
              <button className="btn-logout" onClick={handleLogout}>
                <div className="btn-logout__content">
                  <span>Log Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}