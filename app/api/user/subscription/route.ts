import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { MongoClient } from 'mongodb'

const uri = "mongodb+srv://backend:qOcyo4PRHs9qGuy0@cluster0.19todyv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()
    const db = client.db('yt-comments')

    // Get user's subscription
    const subscription = await db.collection('subscriptions').findOne({
      email: session.user.email
    })

    if (!subscription) {
      // Create a free subscription for new users
      const newSubscription = {
        email: session.user.email,
        userId: session.user.id,
        status: 'active',
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection('subscriptions').insertOne(newSubscription)
      return NextResponse.json(newSubscription)
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update subscription
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { plan, status } = body

    await client.connect()
    const db = client.db('yt-comments')

    const result = await db.collection('subscriptions').updateOne(
      { email: session.user.email },
      {
        $set: {
          plan,
          status,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 