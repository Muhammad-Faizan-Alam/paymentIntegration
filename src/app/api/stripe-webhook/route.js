import { stripe } from '@/lib/stripe';
import User from '@/models/User';
import { buffer } from 'micro';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(request) {
  const buf = await buffer(request);
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionChange(event.data.object);
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.error('Error handling event:', error);
      return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session) {
  if (!session?.subscription) {
    throw new Error('No subscription in session');
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  await updateUserSubscription(subscription.customer, subscription);
}

async function handleSubscriptionChange(subscription) {
  await updateUserSubscription(subscription.customer, subscription);
}

async function updateUserSubscription(customerId, subscription) {
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) throw new Error('User not found');

  const plan = 
    subscription.items.data[0].price.id === PRICE_IDS.basic ? 'basic' :
    subscription.items.data[0].price.id === PRICE_IDS.standard ? 'standard' :
    'premium';

  await User.updateOne(
    { stripeCustomerId: customerId },
    {
      subscription: {
        plan,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        subscriptionId: subscription.id,
      },
    }
  );
}