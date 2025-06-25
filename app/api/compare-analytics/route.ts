import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { extractVideoId, isValidYouTubeUrl } from '@/lib/youtube';

async function checkPythonServer() {
    try {
        const response = await fetch('http://127.0.0.1:8000/health', {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
            headers: { 'Accept': 'application/json' },
        });
        return response.ok;
    } catch (error) {
        console.error('Health check error:', error instanceof Error ? error.message : String(error));
        return false;
    }
}

async function analyzeVideo(videoUrl: string, userId: string) {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
        throw new Error('Could not extract video ID');
    }

    // Check if analysis already exists
    const existingAnalysis = await prisma.analysis.findFirst({
        where: { videoId, userId },
    });

    if (existingAnalysis) {
        return existingAnalysis;
    }

    // Create new analysis
    const analysis = await prisma.analysis.create({
        data: {
            userId,
            videoUrl,
            videoId,
            summary: 'Processing...',
            sentiment: { status: 'processing' },
            comments: [],
            statistics: {},
        },
    });

    // Call Python server for analysis
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
        const pythonResponse = await fetch('http://127.0.0.1:8000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl, analysis_id: analysis.id }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!pythonResponse.ok) {
            const errorData = await pythonResponse.json();
            throw new Error(errorData.error || 'Python analysis failed');
        }

        const analysisResult = await pythonResponse.json();

        // Update analysis in database
        const updatedAnalysis = await prisma.analysis.update({
            where: { id: analysis.id },
            data: {
                summary: 'Completed',
                sentiment: { status: 'completed', error: null },
                visualizations: analysisResult.visualizations,
                aiAnalysis: analysisResult.ai_analysis,
                comments: analysisResult.comments,
                statistics: analysisResult.statistics,
            }
        });

        // Update user's analysis count
        await prisma.user.update({
            where: { id: userId },
            data: {
                analysisCount: { increment: 1 },
                lastAnalysisDate: new Date(),
            },
        });

        return updatedAnalysis;
    } catch (error) {
        await prisma.analysis.update({
            where: { id: analysis.id },
            data: {
                sentiment: {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Analysis failed',
                },
            },
        });
        throw error;
    }
}

async function compareAnalyses(analysis1: any, analysis2: any) {
    const prompt = `
Compare the following two YouTube video analyses:

Video 1:
- Sentiment Distribution: ${JSON.stringify(analysis1.aiAnalysis.sentiment_distribution)}
- Comment Categories: ${JSON.stringify(analysis1.aiAnalysis.comment_categories)}
- Engagement Metrics: ${JSON.stringify(analysis1.aiAnalysis.engagement_metrics)}
- Key Topics: ${JSON.stringify(analysis1.aiAnalysis.key_topics)}
- Overall Analysis: ${JSON.stringify(analysis1.aiAnalysis.overall_analysis)}
- Statistics: ${JSON.stringify(analysis1.statistics)}

Video 2:
- Sentiment Distribution: ${JSON.stringify(analysis2.aiAnalysis.sentiment_distribution)}
- Comment Categories: ${JSON.stringify(analysis2.aiAnalysis.comment_categories)}
- Engagement Metrics: ${JSON.stringify(analysis2.aiAnalysis.engagement_metrics)}
- Key Topics: ${JSON.stringify(analysis2.aiAnalysis.key_topics)}
- Overall Analysis: ${JSON.stringify(analysis2.aiAnalysis.overall_analysis)}
- Statistics: ${JSON.stringify(analysis2.statistics)}

Provide a detailed comparison in this JSON format:
{
  "sentiment_comparison": "text describing sentiment differences",
  "engagement_comparison": "text describing engagement differences",
  "key_topics": {
    "common": ["topic1", "topic2"],
    "unique_to_video1": ["topic3"],
    "unique_to_video2": ["topic4"]
  },
  "comment_categories_comparison": "text describing category differences",
  "community_health_comparison": "text describing community health",
  "other_insights": "text for additional insights"
}

Rules:
1. Base the comparison on the provided data only.
2. Highlight key differences and similarities.
3. Provide actionable insights where possible.
4. Return ONLY the JSON object.
`;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Gemini API call failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Comparison error:', error);
        return {
            sentiment_comparison: 'Unable to compare sentiment due to an error',
            engagement_comparison: 'Unable to compare engagement due to an error',
            key_topics: { common: [], unique_to_video1: [], unique_to_video2: [] },
            comment_categories_comparison: 'Unable to compare categories due to an error',
            community_health_comparison: 'Unable to compare community health due to an error',
            other_insights: 'Comparison failed; please try again later',
        };
    }
}

export async function POST(req: Request) {
    try {
        // Check Python server health
        const isServerHealthy = await checkPythonServer();
        if (!isServerHealthy) {
            return NextResponse.json(
                { error: 'Analysis server is not available', status: 'error' },
                { status: 503 }
            );
        }

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'You must be signed in to compare videos', status: 'error' },
                { status: 401 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, userType: true, analysisCount: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found', status: 'error' },
                { status: 404 }
            );
        }

        // Check free user limit
        if (user.userType === 'FREE' && user.analysisCount >= 1) {
            return NextResponse.json(
                {
                    error: 'Free users can only analyze one video. Please upgrade to PRO.',
                    status: 'error',
                    upgradeRequired: true,
                },
                { status: 403 }
            );
        }

        const { video_url1, video_url2, analysis_id1, analysis_id2 } = await req.json();

        // Validate inputs
        if ((!video_url1 && !analysis_id1) || (!video_url2 && !analysis_id2)) {
            return NextResponse.json(
                { error: 'At least one video URL or analysis ID is required for both videos', status: 'error' },
                { status: 400 }
            );
        }

        let analysis1, analysis2;

        // Handle first video
        if (video_url1) {
            if (!isValidYouTubeUrl(video_url1)) {
                return NextResponse.json(
                    { error: 'Invalid YouTube URL for video 1', status: 'error' },
                    { status: 400 }
                );
            }
            analysis1 = await analyzeVideo(video_url1, user.id);
        } else if (analysis_id1) {
            analysis1 = await prisma.analysis.findUnique({
                where: { id: analysis_id1 },
                // include: { statistics: true, aiAnalysis: true },
            });
            if (!analysis1) {
                return NextResponse.json(
                    { error: 'Analysis ID 1 not found', status: 'error' },
                    { status: 404 }
                );
            }
        }

        // Handle second video
        if (video_url2) {
            if (!isValidYouTubeUrl(video_url2)) {
                return NextResponse.json(
                    { error: 'Invalid YouTube URL for video 2', status: 'error' },
                    { status: 400 }
                );
            }
            analysis2 = await analyzeVideo(video_url2, user.id);
        } else if (analysis_id2) {
            analysis2 = await prisma.analysis.findUnique({
                where: { id: analysis_id2 },
                // include: { aiAnalysis: true },
            });
            if (!analysis2) {
                return NextResponse.json(
                    { error: 'Analysis ID 2 not found', status: 'error' },
                    { status: 404 }
                );
            }
        }

        // Perform comparison
        const comparisonResult = await compareAnalyses(analysis1, analysis2);

        return NextResponse.json({
            status: 'success',
            comparison: comparisonResult,
            analysis_id1: analysis1.id,
            analysis_id2: analysis2.id,
        });
    } catch (error: any) {
        console.error('Comparison error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Internal server error',
                status: 'error',
            },
            { status: error.name === 'AbortError' ? 504 : 500 }
        );
    }
}