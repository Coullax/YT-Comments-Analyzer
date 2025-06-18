import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {getServerSession} from "next-auth";

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
    console.log('page', page);
    console.log('pageSize', pageSize);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: 'You must be signed in to analyze videos', status: 'error' },
            { status: 401 }
        );
    }
    const userId = session?.user?.id;
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