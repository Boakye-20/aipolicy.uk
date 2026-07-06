import { getPolicies } from '@/lib/data';
import TopicsContent from './TopicsContent';

export default async function TopicsPage() {
    const policies = await getPolicies({});
    return <TopicsContent initialPolicies={policies} />;
}
