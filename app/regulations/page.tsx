import { getPolicies } from '@/lib/data';
import { documentTypeCategory } from '@/components/Badges';
import RegulationsContent from './RegulationsContent';
import type { Policy } from '@/types/policy';

// Announcements about rules aren't the rules: news and speeches stay in the
// Explorer, and this page lists only the documents regulators actually issue.
// Transparency records describe how one body uses one tool; they impose nothing.
const EXCLUDED_CATEGORIES = new Set(['News & press releases', 'Speeches & statements', 'Transparency']);

// The model's policy_type label misses real regulatory documents, so these are
// also included whatever their label.
const CONSULTATION_CATEGORIES = new Set(['Open consultation', 'Closed consultation']);
const REGULATORS = new Set(['ICO', 'CMA', 'FCA', 'Ofcom']);
// Same strong-AI terms as ingestion/extract.py _STRONG_AI_RE. Keeps out
// consultations that only touch AI in passing (e.g. T Level content).
const AI_TITLE = /\b(artificial intelligence|ai|machine learning|large language models?|llms?|generative ai|foundation models?|algorithmic|computer vision|natural language processing|deepfakes?)\b/i;
// Regulatory documents no rule above catches. Add a URL here to pin one.
const PINNED_URLS = new Set([
    'https://www.gov.uk/government/publications/ai-cyber-security-code-of-practice',
    'https://www.gov.uk/government/publications/generative-ai-product-safety-standards',
    'https://www.gov.uk/government/publications/the-regulation-of-artificial-intelligence-as-a-medical-device-government-response-to-the-rhc',
]);

function isRegulatoryDocument(p: Policy): boolean {
    const category = documentTypeCategory(p.format);
    if (EXCLUDED_CATEGORIES.has(category)) return false;
    return (
        p.policy_type === 'Regulation & Compliance' ||
        (CONSULTATION_CATEGORIES.has(category) && AI_TITLE.test(p.title)) ||
        (REGULATORS.has(p.dept) && category === 'Guidance') ||
        PINNED_URLS.has(p.url)
    );
}

// Rebuild from the database at most hourly. Without this the page is frozen at
// deploy time and weekly ETL rows never appear until the next deploy.
export const revalidate = 3600;

export default async function RegulationsPage() {
    const policies = await getPolicies();
    const documents = policies.filter(isRegulatoryDocument);
    return <RegulationsContent initialPolicies={documents} />;
}
