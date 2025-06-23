// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../auth/[...nextauth]/route'
// import { prisma } from '@/lib/prisma'
// import { extractVideoId, isValidYouTubeUrl } from '@/lib/youtube'
//
// async function checkPythonServer() {
//   console.log('Checking Python server health...');
//   try {
//     const response = await fetch('http://127.0.0.1:8000/health', {
//       method: 'GET',
//       signal: AbortSignal.timeout(5000), // 5 second timeout
//       headers: {
//         'Accept': 'application/json'
//       }
//     });
//
//     console.log('Health check response status:', response.status);
//     if (!response.ok) {
//       const errorData = await response.text();
//       console.error('Health check failed:', errorData);
//     }
//
//     return response.ok;
//   } catch (error) {
//     console.error('Health check error:', error instanceof Error ? error.message : String(error));
//     return false;
//   }
// }
//
// export async function POST(req: Request) {
//   try {
//     // Check if Python server is running
//     const isServerHealthy = await checkPythonServer();
//     if (!isServerHealthy) {
//       return NextResponse.json(
//         { error: 'Analysis server is not available. Please try again later.', status: 'error' },
//         { status: 503 }
//       );
//     }
//
//     // Check authentication
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json(
//         { error: 'You must be signed in to analyze videos', status: 'error' },
//         { status: 401 }
//       );
//     }
//
//     // Get user
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//       select: {
//         id: true,
//         userType: true,
//         analysisCount: true,
//         lastAnalysisDate: true,
//       },
//     });
//
//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found', status: 'error' },
//         { status: 404 }
//       );
//     }
//
//     // Check if free user has reached their limit
//     if (user.userType === 'FREE') {
//       if (user.analysisCount >= 1) { // Changed to >= 1 to match typical free tier limits
//         return NextResponse.json(
//           {
//             error: 'Free users can only analyze one video. Please upgrade to PRO for unlimited analyses.',
//             status: 'error',
//             upgradeRequired: true
//           },
//           { status: 403 }
//         );
//       }
//     }
//
//     const { video_url } = await req.json();
//
//     if (!video_url) {
//       return NextResponse.json(
//         { error: 'Video URL is required', status: 'error' },
//         { status: 400 }
//       );
//     }
//
//     if (!isValidYouTubeUrl(video_url)) {
//       return NextResponse.json(
//         { error: 'Invalid YouTube URL', status: 'error' },
//         { status: 400 }
//       );
//     }
//
//     // Extract video ID from URL
//     const videoId = extractVideoId(video_url);
//     if (!videoId) {
//       return NextResponse.json(
//         { error: 'Could not extract video ID', status: 'error' },
//         { status: 400 }
//       );
//     }
//
//     // Create initial analysis record
//     const analysis = await prisma.analysis.create({
//       data: {
//         userId: user.id,
//         videoUrl: video_url,
//         videoId,
//         summary: 'Processing...',
//         sentiment: {
//           status: 'processing'
//         },
//       }
//     });
//
//     // Update user's analysis count and last analysis date
//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         analysisCount: {
//           increment: 1
//         },
//         lastAnalysisDate: new Date(),
//       },
//     });
//
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout
//
//       const pythonResponse = await fetch('http://127.0.0.1:8000/api/analyze', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           video_url,
//           analysis_id: analysis.id
//         }),
//         signal: controller.signal
//       });
//
//       clearTimeout(timeoutId);
//
//       if (!pythonResponse.ok) {
//         const errorData = await pythonResponse.json();
//         throw new Error(errorData.error || 'Python analysis failed');
//       }
//
//       const analysisResult = await pythonResponse.json();
//
//       // Update the analysis with results from Python
//       const updatedAnalysis = await prisma.analysis.update({
//         where: { id: analysis.id },
//         data: {
//           summary: 'Completed',
//           sentiment: {
//             status: 'completed',
//             error: null
//           },
//           visualizations: analysisResult.visualizations, // Store as JSON object
//           aiAnalysis: analysisResult.ai_analysis, // Store as JSON object
//         },
//       });
//
//       // Return the full analysis result
//       return NextResponse.json({
//         ...updatedAnalysis,
//         comments: analysisResult.comments,
//         statistics: analysisResult.statistics,
//         visualizations: analysisResult.visualizations,
//         ai_analysis: analysisResult.ai_analysis,
//         status: 'success'
//       });
//
//     } catch (error: any) {
//       // Check if it's a timeout error
//       const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout');
//
//       // Update analysis status to error
//       await prisma.analysis.update({
//         where: { id: analysis.id },
//         data: {
//           sentiment: {
//             status: 'error',
//             error: isTimeout ?
//               'Analysis timed out. The video might have too many comments or the server is busy.' :
//               error.message || 'Analysis failed'
//           }
//         }
//       });
//
//       throw error;
//     }
//   } catch (error: any) {
//     console.error('Analysis error:', error);
//     return NextResponse.json(
//       {
//         error: error.message || 'Internal server error',
//         status: error.name === 'AbortError' ? 'timeout' : 'error',
//         upgradeRequired: error.message?.includes('upgrade') // Set upgradeRequired based on message
//       },
//       { status: error.name === 'AbortError' ? 504 : 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { extractVideoId, isValidYouTubeUrl } from '@/lib/youtube'

async function checkPythonServer() {
  console.log('Checking Python server health...');
  try {
    const response = await fetch('http://127.0.0.1:8000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Health check response status:', response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Health check failed:', errorData);
    }

    return response.ok;
  } catch (error) {
    console.error('Health check error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Check if Python server is running
    const isServerHealthy = await checkPythonServer();
    if (!isServerHealthy) {
      return NextResponse.json(
          { error: 'Analysis server is not available. Please try again later.', status: 'error' },
          { status: 503 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
          { error: 'You must be signed in to analyze videos', status: 'error' },
          { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        userType: true,
        analysisCount: true,
        lastAnalysisDate: true,
      },
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
              error: 'Free users can only analyze one video. Please upgrade to PRO for unlimited analyses.',
              status: 'error',
              upgradeRequired: true
            },
            { status: 403 }
        );
      }
    }

    const { video_url } = await req.json();

    if (!video_url) {
      return NextResponse.json(
          { error: 'Video URL is required', status: 'error' },
          { status: 400 }
      );
    }

    if (!isValidYouTubeUrl(video_url)) {
      return NextResponse.json(
          { error: 'Invalid YouTube URL', status: 'error' },
          { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(video_url);
    if (!videoId) {
      return NextResponse.json(
          { error: 'Could not extract video ID', status: 'error' },
          { status: 400 }
      );
    }

    // Create initial analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        videoUrl: video_url,
        videoId,
        summary: 'Processing...',
        sentiment: {
          status: 'processing'
        },
        comments: [], // Initialize empty comments array
        statistics: {}, // Initialize empty statistics object
      }
    });

    // Update user's analysis count and last analysis date
    await prisma.user.update({
      where: { id: user.id },
      data: {
        analysisCount: {
          increment: 1
        },
        lastAnalysisDate: new Date(),
      },
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

      const pythonResponse = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url,
          analysis_id: analysis.id
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(errorData.error || 'Python analysis failed');
      }

      const analysisResult = await pythonResponse.json();

      // Update the analysis with all results from Python
      const updatedAnalysis = await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          summary: 'Completed',
          sentiment: {
            status: 'completed',
            error: null
          },
          visualizations: analysisResult.visualizations,
          aiAnalysis: analysisResult.ai_analysis,
          comments: analysisResult.comments,
          statistics: analysisResult.statistics,
        },
      });

      // Return the full analysis result
      return NextResponse.json({
        ...updatedAnalysis,
        comments: analysisResult.comments,
        statistics: analysisResult.statistics,
        visualizations: analysisResult.visualizations,
        ai_analysis: analysisResult.ai_analysis,
        status: 'success'
      });

    } catch (error: any) {
      // Check if it's a timeout error
      const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout');

      // Update analysis status to error
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          sentiment: {
            status: 'error',
            error: isTimeout ?
                'Analysis timed out. The video might have too many comments or the server is busy.' :
                error.message || 'Analysis failed'
          }
        }
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
        {
          error: error.message || 'Internal server error',
          status: error.name === 'AbortError' ? 'timeout' : 'error',
          upgradeRequired: error.message?.includes('upgrade')
        },
        { status: error.name === 'AbortError' ? 504 : 500 }
    );
  }
}