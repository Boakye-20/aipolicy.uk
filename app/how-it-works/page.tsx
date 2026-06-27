import {
    Database, ShieldCheck, Filter, RefreshCw, FileSearch, Building2,
} from 'lucide-react';

export const metadata = {
    title: 'How it works | UK AI Policy Tracker',
    description:
        'Where the data comes from, how policies are selected, and how summaries are verified against source documents.',
};

const SOURCES = [
    { name: 'GOV.UK', detail: 'Official publications from 9 trusted departments and regulators (DSIT, DBT, Cabinet Office, Home Office, HM Treasury, DHSC, DfE, CMA).' },
    { name: 'ICO', detail: 'Information Commissioner’s Office — news, blogs and AI/data-protection guidance, pulled directly from ico.org.uk.' },
    { name: 'FCA', detail: 'Financial Conduct Authority — press releases, speeches and publications on AI in financial services, from fca.org.uk.' },
];

export default function HowItWorks() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">How it works</h1>
            <p className="mt-3 text-gray-600">
                This tracker is built to be trustworthy first. Here is exactly where the data
                comes from, how policies are chosen, and how every summary is checked against
                its source before it appears.
            </p>

            {/* Sources */}
            <section className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Building2 className="w-5 h-5 text-blue-600" /> Where the data comes from
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                    Only explicit, trusted government and regulator sources are ingested — a
                    fixed whitelist, never arbitrary web pages.
                </p>
                <div className="mt-4 space-y-3">
                    {SOURCES.map((s) => (
                        <div key={s.name} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900">{s.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{s.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Selection */}
            <section className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Filter className="w-5 h-5 text-blue-600" /> How policies are selected
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                    Documents are filtered for genuine AI relevance using keyword matching on
                    titles and full body text — not hand-picked. Irrelevant material (for
                    example, scam-firm warnings on regulator sites) is excluded by source-path
                    rules so it never reaches the database.
                </p>
            </section>

            {/* Extraction + quote gate */}
            <section className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> How summaries are verified
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                    Each document is processed by a language model constrained to a strict
                    schema — it cannot invent categories or pad summaries with filler. Crucially,
                    if the model states that a policy creates an obligation, it must supply a{' '}
                    <strong>verbatim quote</strong> from the source text that backs that claim.
                </p>
                <div className="mt-4 border-l-4 border-emerald-400 bg-emerald-50 rounded-r-lg p-4">
                    <p className="text-sm text-emerald-900">
                        <strong>The quote gate:</strong> any record that claims obligations without
                        a backing quote is held in a review queue and hidden from this site until a
                        human approves it. So every published summary you read is traceable to the
                        original document — you can expand “Source evidence” on any policy card to
                        see the exact sentence and follow the link to the source.
                    </p>
                </div>
                <p className="mt-3 text-gray-600 text-sm">
                    No AI runs when you load a page. Summaries are produced in advance and read
                    from a database, so there is zero chance of a live hallucination at the moment
                    you view a policy.
                </p>
            </section>

            {/* Pipeline + freshness */}
            <section className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Database className="w-5 h-5 text-blue-600" /> Storage and structure
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                    Clean, schema-validated records are stored in a Postgres database. Database
                    constraints reject malformed rows, and each source document maps to exactly
                    one record (deduplicated by URL).
                </p>
            </section>

            <section className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <RefreshCw className="w-5 h-5 text-blue-600" /> How often it updates
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                    An automated pipeline runs weekly, pulling new publications from every source,
                    extracting and verifying them, and writing them straight to the database —
                    new policies appear without any manual step.
                </p>
            </section>

            <section className="mt-10 flex items-start gap-3 text-sm text-gray-500 border-t border-gray-200 pt-6">
                <FileSearch className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                    This is an independent tracker. It summarises and links to official sources but
                    is not a substitute for the source documents themselves or for professional
                    legal advice.
                </p>
            </section>
        </div>
    );
}
