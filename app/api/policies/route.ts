import { NextResponse } from 'next/server';
import { getPolicies } from '@/lib/data';

// This prevents static optimization and ensures the route is dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Get search params from the URL
        const { searchParams } = new URL(request.url);

        // Filtering is now done in SQL by getPolicies
        const data = await getPolicies({
            dept: searchParams.get('dept'),
            priority: searchParams.get('priority'),
            policyType: searchParams.get('policyType'),
            sector: searchParams.get('sector'),
            aiApplication: searchParams.get('aiApplication'),
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch policies' },
            { status: 500 }
        );
    }
}
