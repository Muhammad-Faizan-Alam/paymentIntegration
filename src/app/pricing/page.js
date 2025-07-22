'use client';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    setPlans([
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
    ]);
  }, []);


  const handleSubscribe = async (priceId, planId) => {
    setLoading(planId);
    setError(null);

    try {
      if (!priceId) throw new Error('Price ID is missing for this plan');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 mb-10">Flexible pricing to suit your needs</p>

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-md max-w-xl mx-auto">
            <strong>Error:</strong> {error} - Please try again or contact support
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition duration-300 border border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800">{plan.name}</h2>
              <h3 className="text-xl text-indigo-600 font-bold mt-2">{plan.price}</h3>
              <ul className="text-gray-600 mt-4 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.stripePriceId, plan.id)}
                disabled={loading === plan.id || !plan.stripePriceId}
                aria-busy={loading === plan.id}
                className={`mt-6 w-full py-2 px-4 rounded-md font-semibold transition duration-300
                  ${!plan.stripePriceId ? 'bg-gray-400 cursor-not-allowed text-white' :
                  loading === plan.id ? 'bg-indigo-300 cursor-wait text-white' :
                  'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                {!plan.stripePriceId
                  ? 'Not Available'
                  : loading === plan.id
                  ? 'Processing...'
                  : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}