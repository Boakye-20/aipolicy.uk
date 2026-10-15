import { getPolicies } from '@/lib/data';
import { documentTypeCategory } from '@/components/Badges';
import RegulationsContent from './RegulationsContent';

// Announcements about rules aren't the rules: news and speeches stay in the
// Explorer, and this page lists only the documents regulators actually issue.
// Transparency records describe how one body uses one tool; they impose nothing.
const EXCLUDED_CATEGORIES = new Set(['News & press releases', 'Speeches & statements', 'Transparency']);

// Rebuild from the database at most hourly. Without this the page is frozen at
// deploy time and weekly ETL rows never appear until the next deploy.
export const revalidate = 3600;

export default async function RegulationsPage() {
    const policies = await getPolicies({ policyType: 'Regulation & Compliance' });
    const documents = policies.filter(p => !EXCLUDED_CATEGORIES.has(documentTypeCategory(p.format)));
    return <RegulationsContent initialPolicies={documents} />;
}
