import { getPolicies } from '@/lib/data';
import AnalyticsContent from './AnalyticsContent';

export default async function AnalyticsPage() {
    const policies = await getPolicies({});
    return <AnalyticsContent initialPolicies={policies} />;
}
