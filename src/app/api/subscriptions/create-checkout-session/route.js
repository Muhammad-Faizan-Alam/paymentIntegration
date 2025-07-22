import { stripe } from '@/lib/stripe';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb'; // Ensure you have this

export async function POST(request) {
  try {
    // Validate Stripe initialization
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    // Parse request
    const { priceId } = await request.json();
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Authentication check
    // const session = request.cookies.get('session')?.value;
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Not authenticated' },
    //     { status: 401 }
    //   );
    // }

    // const user = JSON.parse(session).user;
    const user = {
      email: 'testuser@example.com' // Make sure this exists in your DB
    };

    await connectToDB(); // Ensure DB connection

    // Get or create customer
    let dbUser = await User.findOne({ email: user.email });
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let customerId = dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: dbUser._id.toString() },
      });
      customerId = customer.id;
      await User.updateOne(
        { _id: dbUser._id },
        { stripeCustomerId: customerId }
      );
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      subscription_data: {
        metadata: { userId: dbUser._id.toString() },
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });

  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}