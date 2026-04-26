export type SubscriptionTierId = 'free' | 'starter' | 'growth' | 'pro'

export type SubscriptionTier = {
  id: SubscriptionTierId
  name: string
  priceLabel: string
  frequency: string
  description: string
  highlights: string[]
  lemonSqueezyCheckoutUrl: string
}

const DEFAULT_CHECKOUT_URL = '#'

const checkoutUrlByTier: Record<SubscriptionTierId, string> = {
  free: DEFAULT_CHECKOUT_URL,
  starter: process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL_STARTER || DEFAULT_CHECKOUT_URL,
  growth: process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL_GROWTH || DEFAULT_CHECKOUT_URL,
  pro: process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL_PRO || DEFAULT_CHECKOUT_URL,
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '$0',
    frequency: 'forever',
    description: 'Try the basics with small limits before upgrading.',
    highlights: ['Fetch 100 emails/sync', 'Delete 50 at a time', '1 category', '2 priority keywords'],
    lemonSqueezyCheckoutUrl: checkoutUrlByTier.free,
  },
  {
    id: 'starter',
    name: 'Starter',
    priceLabel: '$7',
    frequency: 'per month',
    description: 'Built for light inbox maintenance and personal accounts.',
    highlights: ['Up to 10k emails/month', 'Core cleanup tools', 'Email support'],
    lemonSqueezyCheckoutUrl: checkoutUrlByTier.starter,
  },
  {
    id: 'growth',
    name: 'Growth',
    priceLabel: '$15',
    frequency: 'per month',
    description: 'For heavy inbox users who want faster, automated cleanup.',
    highlights: ['Up to 50k emails/month', 'Priority processing', 'Advanced filters'],
    lemonSqueezyCheckoutUrl: checkoutUrlByTier.growth,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '$29',
    frequency: 'per month',
    description: 'Best for power users, teams, and multiple inbox workflows.',
    highlights: ['Up to 200k emails/month', 'Multi-account support', 'Priority support'],
    lemonSqueezyCheckoutUrl: checkoutUrlByTier.pro,
  },
]

export const subscriptionTierMap: Record<SubscriptionTierId, SubscriptionTier> =
  subscriptionTiers.reduce((acc, tier) => {
    acc[tier.id] = tier
    return acc
  }, {} as Record<SubscriptionTierId, SubscriptionTier>)
