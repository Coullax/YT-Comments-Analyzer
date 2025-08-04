// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { getServerSession } from "next-auth";
//
// // Fetch analytics from database using Prisma
// async function fetchAnalyticsByUser(userId: string, page: number, pageSize: number) {
//     const total = await prisma.analysis.count({
//         where: { userId },
//     });
//     const data = await prisma.analysis.findMany({
//         where: { userId },
//         orderBy: { createdAt: 'desc' },
//         skip: (page - 1) * pageSize,
//         take: pageSize,
//         select: {
//             id: true,
//             videoUrl: true,
//             videoId: true,
//             summary: true,
//             sentiment: true,
//             visualizations: true,
//             aiAnalysis: true,
//             comments: true,
//             statistics: true,
//             createdAt: true,
//         }
//     });
//
//     // Transform data to match the format expected by frontend
//     const transformedData = data.map(analysis => ({
//         id: analysis.id,
//         videoUrl: analysis.videoUrl,
//         videoId: analysis.videoId,
//         summary: analysis.summary,
//         createdAt: analysis.createdAt.toISOString(),
//         comments: analysis.comments || [],
//         statistics: analysis.statistics || {
//             total_comments: 0,
//             total_likes: 0,
//             average_likes: 0
//         },
//         visualizations: analysis.visualizations || {},
//         aiAnalysis: analysis.aiAnalysis || {
//             sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
//             comment_categories: { questions: 0, praise: 0, suggestions: 0, complaints: 0, general: 0 },
//             engagement_metrics: { high_engagement: 0, medium_engagement: 0, low_engagement: 0 },
//             key_topics: [],
//             overall_analysis: { sentiment: 'Not available', engagement_level: 'Not available', community_health: 'Not available' },
//             recommendations: []
//         }
//     }));
//
//     return { data: transformedData, total };
// }
//
// export async function GET(req: NextRequest) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const page = parseInt(searchParams.get('page') || '1', 10);
//         const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
//
//         const session = await getServerSession(authOptions);
//         if (!session?.user?.email) {
//             return NextResponse.json(
//                 { error: 'You must be signed in to view analytics', status: 'error' },
//                 { status: 401 }
//             );
//         }
//         const userId = session?.user?.id;
//         if (!userId) {
//             return NextResponse.json({ error: 'Missing userId', status: 'error' }, { status: 400 });
//         }
//
//         const { data, total } = await fetchAnalyticsByUser(userId, page, pageSize);
//
//         return NextResponse.json({
//             data,
//             page,
//             pageSize,
//             total,
//             totalPages: Math.ceil(total / pageSize),
//             status: 'success'
//         });
//     } catch (error: any) {
//         console.error('Analytics fetch error:', error);
//         return NextResponse.json(
//             { error: error.message || 'Internal server error', status: 'error' },
//             { status: 500 }
//         );
//     }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from "next-auth";
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Fetch analytics from database using Prisma
async function fetchAnalyticsByUser(userId: string, page: number, pageSize: number) {
    const total = await prisma.analysis.count({
        where: { userId },
    });
    const data = await prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
            id: true,
            videoUrl: true,
            videoId: true,
            summary: true,
            sentiment: true,
            visualizations: true,
            aiAnalysis: true,
            comments: true,
            statistics: true,
            createdAt: true,
        }
    });

    // Transform data to match the format expected by frontend
    const transformedData = data.map(analysis => ({
        id: analysis.id,
        videoUrl: analysis.videoUrl,
        videoId: analysis.videoId,
        summary: analysis.summary,
        createdAt: analysis.createdAt.toISOString(),
        comments: analysis.comments || [],
        statistics: analysis.statistics || {
            total_comments: 0,
            total_likes: 0,
            average_likes: 0
        },
        visualizations: analysis.visualizations || {},
        aiAnalysis: analysis.aiAnalysis || {
            sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
            comment_categories: { questions: 0, praise: 0, suggestions: 0, complaints: 0, general: 0 },
            engagement_metrics: { high_engagement: 0, medium_engagement: 0, low_engagement: 0 },
            key_topics: [],
            overall_analysis: { sentiment: 'Not available', engagement_level: 'Not available', community_health: 'Not available' },
            recommendations: []
        }
    }));

    return { data: transformedData, total };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'You must be signed in to view analytics', status: 'error' },
                { status: 401 }
            );
        }
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId', status: 'error' }, { status: 400 });
        }

        // Check Redis cache
        const cacheKey = `user:analytics:${userId}:page:${page}:size:${pageSize}`;
        try {
            const cachedResults = await redis.get(cacheKey);
            if (cachedResults && typeof cachedResults === 'string') {
                try {
                    const parsedResults = JSON.parse(cachedResults);
                    console.log(`Cache hit for ${cacheKey}`);
                    return NextResponse.json({
                        data: parsedResults.data,
                        page,
                        pageSize,
                        total: parsedResults.total,
                        totalPages: Math.ceil(parsedResults.total / pageSize),
                        status: 'success'
                    });
                } catch (parseError) {
                    console.error(`Invalid JSON in cache for ${cacheKey}:`, parseError);
                    await redis.del(cacheKey);
                }
            }
        } catch (redisError) {
            console.error(`Redis get error for ${cacheKey}:`, redisError);
        }

        // Cache miss or invalid cache, fetch from database
        console.log(`Cache miss for ${cacheKey}, fetching from database`);
        const { data, total } = await fetchAnalyticsByUser(userId, page, pageSize);

        // Cache results for 1 hour (3600 seconds)
        try {
            await redis.set(cacheKey, JSON.stringify({ data, total }), { ex: 3600 });
            console.log(`Cached analytics results for ${cacheKey}`);
        } catch (redisError) {
            console.error(`Redis set error for ${cacheKey}:`, redisError);
        }

        return NextResponse.json({
            data,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
            status: 'success'
        });
    } catch (error: any) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error', status: 'error' },
            { status: 500 }
        );
    }
}