'use client'

import React from 'react'
import Link from 'next/link'
import { subscriptionTiers } from '@/lib/subscriptionTiers'

const SubscriptionsPage = () => {
  return (
    <div className='subscriptions'>
      <div className='subscriptions__content'>
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
              <span className='subscriptions__cta'>Select</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SubscriptionsPage