// app/actions/unsubscribe.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function handleUnSubscription() {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      throw new Error('Unauthorized: Please sign in to unsubscribe')
    }

    // Find the user with their subscription
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        subscription: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.subscription) {
      throw new Error('No active subscription found')
    }

    // If user has a Stripe subscription, cancel it
    if (user.subscription.stripeSubscriptionId) {
      try {
        // Cancel the subscription at period end (so user keeps access until billing period ends)
        await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError)
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Update the subscription status in database
    await prisma.subscription.update({
      where: {
        userId: user.id
      },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    })

    // Update user type to FREE
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        userType: 'FREE'
      }
    })

    return { success: true, message: 'Subscription cancelled successfully' }

  } catch (error) {
    console.error('Unsubscribe error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to cancel subscription')
  }
}