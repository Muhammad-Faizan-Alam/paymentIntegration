import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID,
  standard: process.env.STRIPE_STANDARD_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};