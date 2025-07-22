'use client';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// Initialize Stripe outside component to prevent multiple initializations
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

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
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID
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
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID
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
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID
    }
  ];

  const handleSubscribe = async (priceId, planId) => {
    setLoading(planId);
    setError(null);
    
    try {
      // Validate priceId exists
      if (!priceId) {
        throw new Error('Price ID is missing for this plan');
      }

      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Create checkout session
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-container">
      <h1>Choose Your Plan</h1>
      {error && (
        <div className="error-message">
          Error: {error} - Please try again or contact support
        </div>
      )}
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
              disabled={loading === plan.id || !plan.stripePriceId}
              aria-busy={loading === planId}
            >
              {!plan.stripePriceId ? 'Not Available' : 
               loading === plan.id ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}