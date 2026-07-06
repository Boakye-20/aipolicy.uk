import { PrismaClient, Prisma } from '@prisma/client';
import { Policy } from '@/types/policy';

const prisma = new PrismaClient();

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
        const where: Prisma.PolicyWhereInput = { status: 'live' };

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
