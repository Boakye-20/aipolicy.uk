import { NextResponse } from 'next/server';
import { getPolicies } from '@/lib/data';

// This prevents static optimization and ensures the route is dynamic
export const dynamic = 'force-dynamic';

const MAX_PARAM_LENGTH = 100;

function sanitiseParam(value: string | null): string | null {
    if (value === null) return null;
    if (value.length > MAX_PARAM_LENGTH) return null; // reject oversized values
    return value;
}

export async function GET(request: Request) {
    try {
        // Get search params from the URL
        const { searchParams } = new URL(request.url);

        // Filtering is now done in SQL by getPolicies
        const data = await getPolicies({
            dept: sanitiseParam(searchParams.get('dept')),
            priority: sanitiseParam(searchParams.get('priority')),
            policyType: sanitiseParam(searchParams.get('policyType')),
            sector: sanitiseParam(searchParams.get('sector')),
            aiApplication: sanitiseParam(searchParams.get('aiApplication')),
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch policies' },
            { status: 500 }
        );
    }
}
