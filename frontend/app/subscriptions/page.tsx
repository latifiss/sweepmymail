'use client'

import React from 'react'
import Link from 'next/link'
import Bloc from '@/components/bloc'
import { subscriptionTiers } from '@/lib/subscriptionTiers'

const SubscriptionsPage = () => {
  return (
    <div className='subscriptions'>
      <div className='subscriptions__top'>
        <h1 className='subscriptions__top__title'>Make a magic✨</h1>
        <div className='subscriptions__top__block'>
        <Bloc
          title="Categorize"
          caption="Organize your content into custom categories for better management"
          type="categorize"
        />
        <Bloc
          title="Summary"
          caption="Get AI-powered summaries of your content and activities"
          type="summary"
        />
        <Bloc
          title="Priority List"
          caption="Manage and track your high-priority tasks efficiently"
          type="list"
        />
        </div>
      </div>
      <div className='subscriptions__content'>
      <h1 className='subscriptions__top__title'>Wanna upgrade🤔?</h1>

        <div className='subscriptions__pricing'>
          {subscriptionTiers.map((tier) => (
            <Link
              key={tier.id}
              href={`/subscriptions/${tier.id}`}
              className="bloc no-underline hover:no-underline focus:no-underline active:no-underline"
              style={{ textDecoration: 'none' }}
            >
              <div className='bloc__left'>
                <div className='bloc__left__center'>
                  <span className='bloc__left__center__title'>
                    {tier.name} - {tier.priceLabel} {tier.frequency}
                  </span>
                  <p className='bloc__left__center__caption'>{tier.description}</p>
                </div>
              </div>
              <div className='bloc__right'>
                <span className='subscriptions__cta'>Choose</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionsPage