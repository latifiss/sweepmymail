import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  subscriptionTierMap,
  type SubscriptionTierId,
} from '@/lib/subscriptionTiers'

type TierPageProps = {
  params: Promise<{
    tier: string
  }>
}

const TierPage = async ({ params }: TierPageProps) => {
  const { tier: tierParam } = await params
  const tierId = tierParam as SubscriptionTierId
  const tier = subscriptionTierMap[tierId]

  if (!tier) {
    notFound()
  }

  const hasValidCheckoutUrl =
    tier.lemonSqueezyCheckoutUrl &&
    tier.lemonSqueezyCheckoutUrl !== '#' &&
    tier.lemonSqueezyCheckoutUrl.startsWith('http')

  return (
    <div className='subscriptions'>
      <div className='subscriptions__content'>
        <div className='subscriptions__detail'>
          <h1 className='subscriptions__title'>
            {tier.name} - {tier.priceLabel} {tier.frequency}
          </h1>
          <p className='subscriptions__description'>{tier.description}</p>

          <div className='subscriptions__features'>
            {tier.highlights.map((feature) => (
              <p key={feature} className='subscriptions__feature'>
                {feature}
              </p>
            ))}
          </div>

          {hasValidCheckoutUrl ? (
            <a
              className='pricing-popup__cta subscriptions__buy-link'
              href={tier.lemonSqueezyCheckoutUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              Continue with LemonSqueezy
            </a>
          ) : (
            <div className='subscriptions__description'>
              Checkout link is not configured yet for this tier.
            </div>
          )}

          <Link href='/subscriptions' className='pricing-popup__dismiss'>
            Back to all tiers
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TierPage
