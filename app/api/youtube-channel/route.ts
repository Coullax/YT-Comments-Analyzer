import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyAaCfO0i6W2K9NLgvU0h8NjQxAxPZ5qbF8';
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

export async function POST(req: Request) {
    try {
        // Get session using the authOptions
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get channel URL from request body
        const { channelUrl } = await req.json();
        if (!channelUrl) {
            return NextResponse.json({ error: 'Channel URL is required' }, { status: 400 });
        }

        // Step 1: Get channel ID
        const channelId = await getChannelIdFromUrl(channelUrl);

        // Step 2: Get upload playlist ID
        const playlistId = await getUploadPlaylistId(channelId);

        // Step 3: Get video IDs
        const videoIds = await getVideoIds(playlistId);

        return NextResponse.json({
            success: true,
            channelId,
            videoIds,
            totalVideos: videoIds.length,
        });
    } catch (error: any) {
        console.error('YouTube API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Placeholder PUT route for future extensions (e.g., storing video IDs)
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Example: Update user with stored video IDs (extend as needed)
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