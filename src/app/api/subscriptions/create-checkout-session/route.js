import { stripe } from '@/lib/stripe';
import { PRICE_IDS } from '@/lib/stripe';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { priceId } = await request.json();
  const session = request.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = JSON.parse(session).user;

  // Get or create customer in Stripe
  let dbUser = await User.findOne({ email: user.email });
  let customerId;

  if (dbUser?.stripeCustomerId) {
    customerId = dbUser.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: dbUser?._id.toString(),
      },
    });

    customerId = customer.id;
    await User.updateOne(
      { email: user.email },
      { stripeCustomerId: customerId }
    );
  }

  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${request.headers.get('origin')}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.headers.get('origin')}/pricing`,
    subscription_data: {
      metadata: {
        userId: dbUser?._id.toString(),
      },
    },
  });

  return NextResponse.json({ sessionId: checkoutSession.id });
}