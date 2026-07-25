import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// ── Framework mapping ────────────────────────────────────────────────────────
// Maps the tracker's dept codes and topic keywords to the four compliance
// frameworks consumed by the AI Compliance Tool's policy-sync banner.

const DEPT_TO_FRAMEWORK: Record<string, string> = {
    ICO: 'UK ICO',
};

// Policies from these UK government departments default to UK DPA/GDPR
// unless overridden by topic-based matching below.
const UK_GOV_DEPTS = new Set([
    'DSIT', 'Cabinet_Office', 'Home_Office', 'Treasury',
    'DfE', 'DHSC', 'DBT', 'CMA', 'FCA',
]);

function inferFramework(dept: string | null, primaryTopic: string | null, keyTopics: string | null): string | null {
    const topics = `${primaryTopic || ''} ${keyTopics || ''}`.toLowerCase();

    // Topic-based overrides take priority
    if (topics.includes('eu ai act') || topics.includes('artificial intelligence act')) {
        return 'EU AI Act';
    }
    if (topics.includes('iso') || topics.includes('42001')) {
        return 'ISO 42001';
    }

    // Dept-based mapping
    if (dept && DEPT_TO_FRAMEWORK[dept]) {
        return DEPT_TO_FRAMEWORK[dept];
    }
    if (dept && UK_GOV_DEPTS.has(dept)) {
        return 'UK DPA/GDPR';
    }

    return null;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
    try {
        const policies = await prisma.policy.findMany({
            where: { status: 'live' },
            orderBy: { published_date: 'desc' },
            take: 50,
            select: {
                id: true,
                title: true,
                dept: true,
                primary_topic: true,
                key_topics: true,
                published_date: true,
                url: true,
            },
        });

        const updates = policies.map((p) => ({
            id: p.id,
            title: p.title,
            framework: inferFramework(p.dept, p.primary_topic, p.key_topics),
            date: p.published_date
                ? p.published_date.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            url: p.url || undefined,
        }));

        return NextResponse.json(
            { updates },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
                },
            },
        );
    } catch (error) {
        console.error('Error generating updates feed:', error);
        return NextResponse.json(
            { updates: [], error: 'Failed to generate updates feed' },
            { status: 500 },
        );
    }
}
