import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!checkoutSession) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      )
    }

    // Get the subscription ID from the checkout session
    const subscriptionId = checkoutSession.subscription as string

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    // Retrieve the subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    try {
      // First, try to update or create the subscription
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          status: stripeSubscription.status,
          plan: 'pro',
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        },
        update: {
          status: stripeSubscription.status,
          plan: 'pro',
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        },
      })

      // Then, update the user type
      await prisma.user.update({
        where: { id: user.id },
        data: {
          userType: 'PRO'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription verified and updated successfully',
      })
    } catch (error) {
      console.error('Subscription update error:', error)
      throw error
    }
  } catch (error: any) {
    console.error('Error verifying subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 