
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Check user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user exists and has appropriate access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Optionally, check for subscription plan if frame extraction is a premium feature
    if (!user.subscription || user.subscription.plan !== 'pro') {
      return NextResponse.json({ error: 'No active Pro subscription' }, { status: 400 });
    }

    const { youtube_url, time } = await req.json();

    // Validate inputs
    if (!youtube_url || !time) {
      return NextResponse.json({ error: 'Missing YouTube URL or time' }, { status: 400 });
    }

    // Forward request to Python backend
    const backendResponse = await fetch('http://127.0.0.1:8000/api/extract-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_url, time }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to extract frame' },
        { status: backendResponse.status },
      );
    }

    // Stream the image response back to the client
    const blob = await backendResponse.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: { 'Content-Type': 'image/jpeg' },
    });

  } catch (error :any) {
    console.error('Frame extraction error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to extract frame' },
      { status: 500 },
    );
  }
}