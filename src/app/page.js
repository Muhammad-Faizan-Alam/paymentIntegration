'use client';
import { useRouter } from 'next/navigation';

const plans = [
  { name: 'Basic', price: 9, priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID },
  { name: 'Standard', price: 29, priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID },
  { name: 'Premium', price: 99, priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID },
];

export default function HomePage() {
  const router = useRouter();

  const handleSubscribe = async (priceId) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
      <h1 className="text-4xl font-bold mb-6">Choose a Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="p-6 border rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-xl mb-4">${plan.price}/month</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleSubscribe(plan.priceId)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}