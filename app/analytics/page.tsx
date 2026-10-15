import { getPolicies } from '@/lib/data';
import AnalyticsContent from './AnalyticsContent';

// Rebuild from the database at most hourly. Without this the page is frozen at
// deploy time and weekly ETL rows never appear until the next deploy.
export const revalidate = 3600;

export default async function AnalyticsPage() {
    const policies = await getPolicies({});
    return <AnalyticsContent initialPolicies={policies} />;
}
