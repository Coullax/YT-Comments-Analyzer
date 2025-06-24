import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user || !user.subscription || user.subscription.plan !== 'pro') {
      return NextResponse.json({ error: 'No active Pro subscription' }, { status: 400 })
    }

    const subscriptionId = user.subscription.stripeSubscriptionId
    const stripeCustomerId = user.subscription.stripeCustomerId

    if (!subscriptionId || !stripeCustomerId) {
      return NextResponse.json({ error: 'Missing Stripe subscription data' }, { status: 400 })
    }

    // ❌ Cancel Stripe subscription
    await stripe.subscriptions.cancel(subscriptionId)

    // 🗑️ Delete subscription record or mark as canceled
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan: 'free',
        status: 'canceled',
        stripeSubscriptionId: null,
        stripeCustomerId: null
      }
    })

    // 🧹 Update user to FREE
    await prisma.user.update({
      where: { id: user.id },
      data: {
        userType: 'FREE',
        analysisCount: 0,
        lastAnalysisDate: null
      }
    })

    return NextResponse.json({ success: true, message: 'Subscription canceled successfully' })

  } catch (error: any) {
    console.error('Unsubscribe error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}