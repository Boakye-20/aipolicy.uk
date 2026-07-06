import { getPolicies } from '@/lib/data';
import PolicyExplorerContent from './PolicyExplorerContent';

export default async function PolicyExplorerPage({
    searchParams,
}: {
    searchParams: { q?: string; dept?: string };
}) {
    const policies = await getPolicies({});
    return (
        <PolicyExplorerContent
            initialPolicies={policies}
            initialSearch={searchParams.q || ''}
            initialDept={searchParams.dept || ''}
        />
    );
}
