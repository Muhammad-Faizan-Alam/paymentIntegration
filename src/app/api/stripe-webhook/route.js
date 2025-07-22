// app/api/stripe-webhook/route.js
import { stripe } from '@/lib/stripe';
import { buffer } from 'micro';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle events here
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('💰 Payment received:', session);
  }

  return new NextResponse(null, { status: 200 });
}