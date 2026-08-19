import { Prisma } from '@prisma/client';
import { Policy } from '@/types/policy';
import { prisma } from '@/lib/prisma';

// Coverage begins 1 January 2025 — a deliberate cutoff. The ETL only sweeps
// sources comprehensively from this point; older documents surface patchily
// (whatever happened to match a search), so showing them implies a
// completeness we don't have. Surface this date in the UI wherever counts
// are shown so users know the window is intentional.
export const COVERAGE_START = new Date('2025-01-01');

export async function getPolicies(filters?: {
    dept?: string | null;
    priority?: string | null;
    policyType?: string | null;
    sector?: string | null;
    aiApplication?: string | null;
}): Promise<Policy[]> {
    try {
        // Only live rows reach users. Anything in the review queue
        // (status='review' — obligations without a verbatim quote) stays hidden
        // until a human approves it by setting status='live'.
        const where: Prisma.PolicyWhereInput = {
            status: 'live',
            published_date: { gte: COVERAGE_START },
        };

        if (filters?.dept) {
            where.dept = filters.dept;
        }
        if (filters?.priority) {
            where.priority_category = filters.priority;
        }
        if (filters?.policyType) {
            where.policy_type = filters.policyType;
        }
        if (filters?.sector) {
            where.sector_focus = filters.sector;
        }
        if (filters?.aiApplication) {
            where.ai_application = filters.aiApplication;
        }

        const policies = await prisma.policy.findMany({
            where,
            orderBy: {
                published_date: 'desc',
            },
        });

        return policies as unknown as Policy[];
    } catch (error) {
        console.error('Error fetching policies:', error);
        throw error;
    }
}
