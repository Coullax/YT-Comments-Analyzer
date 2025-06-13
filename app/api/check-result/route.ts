import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const analysisId = searchParams.get('analysis_id');

  if (!analysisId) {
    return NextResponse.json(
      { error: 'Missing analysis_id' },
      { status: 400 }
    );
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        user: true
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    if (analysis.summary === 'Processing...') {
      return NextResponse.json({ status: 'processing' });
    }

    if (analysis.summary === 'Completed') {
      // Return full result
      return NextResponse.json({
        status: 'completed',
        analysis
      });
    }

    if (analysis.sentiment?.error) {
      return NextResponse.json(
        { status: 'error', error: analysis.sentiment.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: 'unknown' });
  } catch (error) {
    console.error('Error checking result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}