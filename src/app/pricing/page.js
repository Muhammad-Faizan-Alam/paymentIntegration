'use client';
import { loadStripe } from '@stripe/stripe-js';
import { PRICE_IDS } from '@/lib/stripe';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const plans = [
  {
    name: 'Basic',
    id: 'basic',
    price: '$9/month',
    features: [
      'Up to 100 requests/month',
      'Basic support',
      'Email notifications'
    ],
    stripePriceId: PRICE_IDS.basic
  },
  {
    name: 'Standard',
    id: 'standard',
    price: '$29/month',
    features: [
      'Up to 1,000 requests/month',
      'Priority support',
      'Webhook integration',
      'Basic analytics'
    ],
    stripePriceId: PRICE_IDS.standard
  },
  {
    name: 'Premium',
    id: 'premium',
    price: '$99/month',
    features: [
      'Unlimited requests',
      '24/7 support',
      'Advanced analytics',
      'API access',
      'Team management'
    ],
    stripePriceId: PRICE_IDS.premium
  }
];

export default function PricingPage() {
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (priceId, planId) => {
    setLoading(planId);
    
    try {
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error(error);
      alert('Error creating checkout session');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-container">
      <h1>Choose Your Plan</h1>
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <h2>{plan.name}</h2>
            <h3>{plan.price}</h3>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.stripePriceId, plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}