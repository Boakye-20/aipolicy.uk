import { getPolicies } from '@/lib/data';
import PolicyExplorerContent from './PolicyExplorerContent';

export default async function PolicyExplorerPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; dept?: string }>;
}) {
    const [policies, resolvedParams] = await Promise.all([getPolicies({}), searchParams]);
    return (
        <PolicyExplorerContent
            initialPolicies={policies}
            initialSearch={resolvedParams.q || ''}
            initialDept={resolvedParams.dept || ''}
        />
    );
}
