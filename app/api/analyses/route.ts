import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'You must be signed in to fetch analyses', status: 'error' },
                { status: 401 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found', status: 'error' },
                { status: 404 }
            );
        }

        // Fetch analyses for the user
        const analyses = await prisma.analysis.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                videoUrl: true,
                videoId: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            status: 'success',
            analyses,
        });
    } catch (error: any) {
        console.error('Fetch analyses error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Internal server error',
                status: 'error',
            },
            { status: 500 }
        );
    }
}