import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'

const stripe = new Stripe("sk_test_51RWtL1P4c9HnIgUrVmrBBwhZSsQLDW0h5sTT6DJ4vvJqWyO999tdkR70aaHKjhBCyOkOrOJnbo2Y7gcqmFActvKl00toxoyNWc", {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  try {
    // Get session using the authOptions
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    })

    // Create or retrieve Stripe customer
    let stripeCustomerId = subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
      })
      stripeCustomerId = customer.id

      // Update subscription with Stripe customer ID
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { 
          stripeCustomerId,
        }
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: "price_1RWtWLP4c9HnIgUr1uZVW1R2",
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Webhook handler for Stripe events
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { userId, plan, status } = body

    try {
      // Update both subscription and user type based on status
      await prisma.$transaction(async (tx) => {
        // Upsert subscription
        await tx.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan,
            status,
          },
          update: {
            plan,
            status,
          }
        });

        // Update user type based on subscription status
        await tx.user.update({
          where: { id: userId },
          data: {
            userType: status === 'active' && plan === 'pro' ? 'PRO' : 'FREE'
          }
        });
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription and user type updated successfully' 
      });
    } catch (error) {
      console.error('Transaction error:', error);
      throw error; // Re-throw to be caught by the outer catch block
    }
  } catch (error: any) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 