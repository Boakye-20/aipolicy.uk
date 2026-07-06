import { getPolicies } from '@/lib/data';
import RegulationsContent from './RegulationsContent';

export default async function RegulationsPage() {
    const policies = await getPolicies({ policyType: 'Regulation & Compliance' });
    return <RegulationsContent initialPolicies={policies} />;
}
