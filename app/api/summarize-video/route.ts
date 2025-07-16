import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { extractVideoId, isValidYouTubeUrl } from '@/lib/youtube';


export async function POST(req: Request) {
  try {

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to summarize videos', status: 'error' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, userType: true, analysisCount: true, lastAnalysisDate: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', status: 'error' },
        { status: 404 }
      );
    }

    // Check if free user has reached their limit
    if (user.userType === 'FREE') {
      if (user.analysisCount >= 1) {
        return NextResponse.json(
          {
            error: 'Free users can only summarize one video. Please upgrade to PRO for unlimited summarizations.',
            status: 'error',
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    const { youtube_url, start_time, end_time } = await req.json();

    // Validate inputs
    if (!youtube_url) {
      return NextResponse.json(
        { error: 'YouTube URL is required', status: 'error' },
        { status: 400 }
      );
    }

    if (!isValidYouTubeUrl(youtube_url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL', status: 'error' },
        { status: 400 }
      );
    }

    if ((start_time && !/^\d{2}:\d{2}:\d{2}$|^\d+$/.test(start_time)) ||
        (end_time && !/^\d{2}:\d{2}:\d{2}$|^\d+$/.test(end_time))) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM:SS or seconds.', status: 'error' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(youtube_url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID', status: 'error' },
        { status: 400 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const pythonResponse = await fetch('http://127.0.0.1:8000/api/summarize-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_url,
          start_time,
          end_time,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(errorData.error || 'Video summarization failed');
      }

      const summaryData = await pythonResponse.json();


      return NextResponse.json({
        ...summaryData,
      });

    } catch (error:any) {
      const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout');
      
      throw error;
    }
  } catch (error:any) {
    console.error('Video summarization error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        status: error.name === 'AbortError' ? 'timeout' : 'error',
        upgradeRequired: error.message?.includes('upgrade'),
      },
      { status: error.name === 'AbortError' ? 504 : 500 }
    );
  }
}