import type { ReactNode } from 'react';
import { FreeIcon, ProIcon, SuperIcon } from '@/public/icons/svg';
import BaseButton from '@/components/buttons/baseButton';

type PlanId = 'free' | 'pro' | 'super';

interface PlanFeature {
  icon: ReactNode;
  label: string;
}

interface Plan {
  id: PlanId;
  badge: ReactNode;
  price: string;
  period?: string;
  features: PlanFeature[];
  cta: string;
  ctaVariant: 'default' | 'alternate';
}

const PLANS: Plan[] = [
  {
    id: 'free',
    badge: <FreeIcon />,
    price: '$0.00',
    features: [
      { icon: <span className="pricing-card__icon pricing-card__icon--house" />, label: 'Unlimited Emails' },
      { icon: <span className="pricing-card__icon pricing-card__icon--dots" />, label: '20 Categories' },
      { icon: <span className="pricing-card__icon pricing-card__icon--keyhole" />, label: '35 Priority Keywords' },
    ],
    cta: 'Continue',
    ctaVariant: 'alternate',
  },
  {
    id: 'pro',
    badge: <ProIcon />,
    price: '$4.99',
    period: 'per month',
    features: [
      { icon: <span className="pricing-card__icon pricing-card__icon--house" />, label: 'Unlimited Emails' },
      { icon: <span className="pricing-card__icon pricing-card__icon--dots" />, label: '20 Categories' },
      { icon: <span className="pricing-card__icon pricing-card__icon--keyhole" />, label: '35 Priority Keywords' },
      { icon: <span className="pricing-card__icon pricing-card__icon--rainbow" />, label: 'Daily Summary' },
    ],
    cta: 'Upgrade',
    ctaVariant: 'default',
  },
  {
    id: 'super',
    badge: <SuperIcon />,
    price: '$9.99',
    period: 'per month',
    features: [
      { icon: <span className="pricing-card__icon pricing-card__icon--house" />, label: 'Unlimited Emails' },
      { icon: <span className="pricing-card__icon pricing-card__icon--dots" />, label: '75 Categories' },
      { icon: <span className="pricing-card__icon pricing-card__icon--keyhole" />, label: '90 Priority Keywords' },
      { icon: <span className="pricing-card__icon pricing-card__icon--rainbow" />, label: 'Daily Summary' },
    ],
    cta: 'Upgrade',
    ctaVariant: 'default',
  },
];

export default function PricingPage(): ReactNode {
  return (
    <main className="pricing-page">
      <div className="pricing-page__inner">
        <h1 className="pricing-page__title">Pricing</h1>

        <div className="pricing-page__grid">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`pricing-card pricing-card--${plan.id}`}
            >
              <header className="pricing-card__badge">
                {plan.badge}
              </header>

              <div className="pricing-card__price-row">
                <span className="pricing-card__price">{plan.price}</span>
                {plan.period && (
                  <span className="pricing-card__period">{plan.period}</span>
                )}
              </div>

              <ul className="pricing-card__features">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="pricing-card__feature">
                    {feature.icon}
                    <span className="pricing-card__feature-label">
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              <footer className="pricing-card__action">
                <BaseButton variant={plan.ctaVariant}>{plan.cta}</BaseButton>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}