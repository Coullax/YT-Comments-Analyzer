import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function getChannelIdFromUrl(channelUrl: string): Promise<string> {
    let url: string;
    if (channelUrl.includes('/channel/')) {
        return channelUrl.split('/channel/')[1].split('/')[0];
    } else if (channelUrl.includes('/@')) {
        const handle = channelUrl.match(/@[\w-]+/)?.[0];
        if (!handle) throw new Error('Invalid channel URL format');
        url = `${YOUTUBE_API_BASE_URL}/channels?part=id&forHandle=${handle}&key=${YOUTUBE_API_KEY}`;
    } else if (channelUrl.includes('/user/')) {
        const username = channelUrl.split('/user/')[1].split('/')[0];
        url = `${YOUTUBE_API_BASE_URL}/channels?part=id&forUsername=${username}&key=${YOUTUBE_API_KEY}`;
    } else {
        throw new Error('Invalid channel URL format');
    }

    const response = await fetch(url);
    const data = await response.json();
    if (!data.items || data.items.length === 0) {
        throw new Error('Channel not found');
    }
    return data.items[0].id;
}

async function getUploadPlaylistId(channelId: string): Promise<string> {
    const url = `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.items || data.items.length === 0) {
        throw new Error('Upload playlist not found');
    }
    return data.items[0].contentDetails.relatedPlaylists.uploads;
}

async function getVideoIds(playlistId: string, maxResults: number = 50): Promise<string[]> {
    const videoIds: string[] = [];
    let nextPageToken: string | null = null;

    do {
        const url = `${YOUTUBE_API_BASE_URL}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=${maxResults}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            for (const item of data.items) {
                videoIds.push(item.contentDetails.videoId);
            }
        }
        nextPageToken = data.nextPageToken || null;
    } while (nextPageToken);

    return videoIds;
}

// POST: Save a YouTube channel URL or fetch video IDs
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { channelUrl, action } = await req.json();
        if (!channelUrl) {
            return NextResponse.json({ error: 'Channel URL is required' }, { status: 400 });
        }

        if (action === 'save') {
            const channelId = await getChannelIdFromUrl(channelUrl);

            const existingChannel = await prisma.channel.findFirst({
                where: {
                    userId: user.id,
                    channelUrl: channelUrl,
                },
            });

            if (existingChannel) {
                return NextResponse.json({ error: 'Channel URL already saved' }, { status: 409 });
            }

            const savedChannel = await prisma.channel.create({
                data: {
                    userId: user.id,
                    channelUrl,
                    channelId,
                },
            });

            // Invalidate user channels cache
            try {
                await redis.del(`user:channels:${user.id}`);
                console.log(`Cache invalidated for user:channels:${user.id}`);
            } catch (redisError) {
                console.error('Redis cache invalidation error:', redisError);
            }

            return NextResponse.json({
                success: true,
                message: 'Channel URL saved successfully',
                channel: savedChannel,
            });
        }

        // Fetch video IDs with caching
        const channelId = await getChannelIdFromUrl(channelUrl);
        const cacheKey = `channel:videos:${channelId}`;
        let videoIds: string[] = [];

        try {
            const cachedVideos = await redis.get(cacheKey);
            if (cachedVideos && typeof cachedVideos === 'string') {
                try {
                    videoIds = JSON.parse(cachedVideos);
                    console.log(`Cache hit for ${cacheKey}`);
                    return NextResponse.json({
                        success: true,
                        channelId,
                        videoIds,
                        totalVideos: videoIds.length,
                    });
                } catch (parseError) {
                    console.error(`Invalid JSON in cache for ${cacheKey}:`, parseError);
                    // Clear corrupted cache
                    await redis.del(cacheKey);
                }
            }
        } catch (redisError) {
            console.error(`Redis get error for ${cacheKey}:`, redisError);
        }

        // Cache miss or invalid cache, fetch from YouTube API
        console.log(`Cache miss for ${cacheKey}, fetching from YouTube API`);
        const playlistId = await getUploadPlaylistId(channelId);
        videoIds = await getVideoIds(playlistId);

        // Cache video IDs for 1 hour (3600 seconds)
        try {
            await redis.set(cacheKey, JSON.stringify(videoIds), { ex: 3600 });
            console.log(`Cached video IDs for ${cacheKey}`);
        } catch (redisError) {
            console.error(`Redis set error for ${cacheKey}:`, redisError);
        }

        return NextResponse.json({
            success: true,
            channelId,
            videoIds,
            totalVideos: videoIds.length,
        });
    } catch (error: any) {
        console.error('YouTube API or database error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Fetch all saved channel URLs for the logged-in user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check Redis cache
        const cacheKey = `user:channels:${user.id}`;
        let channels: any[] = [];

        try {
            const cachedChannels = await redis.get(cacheKey);
            if (cachedChannels && typeof cachedChannels === 'string') {
                try {
                    channels = JSON.parse(cachedChannels);
                    console.log(`Cache hit for ${cacheKey}`);
                    return NextResponse.json({
                        success: true,
                        channels,
                        totalChannels: channels.length,
                    });
                } catch (parseError) {
                    console.error(`Invalid JSON in cache for ${cacheKey}:`, parseError);
                    // Clear corrupted cache
                    await redis.del(cacheKey);
                }
            }
        } catch (redisError) {
            console.error(`Redis get error for ${cacheKey}:`, redisError);
        }

        // Cache miss or invalid cache, fetch from database
        console.log(`Cache miss for ${cacheKey}, fetching from database`);
        channels = await prisma.channel.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                channelUrl: true,
                channelId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Cache channels for 1 hour (3600 seconds)
        try {
            await redis.set(cacheKey, JSON.stringify(channels), { ex: 3600 });
            console.log(`Cached channels for ${cacheKey}`);
        } catch (redisError) {
            console.error(`Redis set error for ${cacheKey}:`, redisError);
        }

        return NextResponse.json({
            success: true,
            channels,
            totalChannels: channels.length,
        });
    } catch (error: any) {
        console.error('Fetch channels error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT: Placeholder for future extensions
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            message: 'PUT endpoint not implemented for this use case',
        });
    } catch (error: any) {
        console.error('PUT request error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}