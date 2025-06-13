import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch analytics from a database using Prisma
async function fetchAnalyticsByUser(userId: string, page: number, pageSize: number) {
    const total = await prisma.analysis.count({
        where: { userId },
    });
    const data = await prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    return { data, total };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data, total } = await fetchAnalyticsByUser(userId, page, pageSize);

    return NextResponse.json({
        data,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    });
}