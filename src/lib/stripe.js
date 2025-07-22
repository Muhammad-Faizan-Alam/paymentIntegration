import Stripe from 'stripe';

// Validate environment variable
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16', // Use latest stable API version
});

// Validate price IDs
export const PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID,
  standard: process.env.STRIPE_STANDARD_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

// Validate all price IDs are present
for (const [plan, priceId] of Object.entries(PRICE_IDS)) {
  if (!priceId) {
    throw new Error(`Missing Stripe price ID for ${plan} plan`);
  }
}