// app/api/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        subscription: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If user has no subscription, return default free plan
    if (!user.subscription) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null
      })
    }

    // Return subscription details
    return NextResponse.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      stripeCustomerId: user.subscription.stripeCustomerId,
      createdAt: user.subscription.createdAt,
      updatedAt: user.subscription.updatedAt
    })

  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}