'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Policy } from '@/types/policy';
import { documentTypeCategory } from '@/components/Badges';
import { formatDate, withinDays } from '@/lib/utils';
import { Search, ArrowRight, ExternalLink, TrendingUp, FileText, AlertCircle, BookOpen } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBadgeClass(policyType: string): string {
    const map: Record<string, string> = {
        'Regulation & Compliance':   'policy-badge policy-badge--reg',
        'Strategy & Frameworks':     'policy-badge policy-badge--str',
        'Implementation Guidance':   'policy-badge policy-badge--imp',
        'Research & Analysis':       'policy-badge policy-badge--res',
        'Funding & Investment':      'policy-badge policy-badge--fund',
        'International Cooperation': 'policy-badge policy-badge--guid',
    };
    return map[policyType] ?? 'policy-badge policy-badge--guid';
}

function getBadgeLabel(policyType: string): string {
    const map: Record<string, string> = {
        'Regulation & Compliance':   'Regulation',
        'Strategy & Frameworks':     'Strategy',
        'Implementation Guidance':   'Guidance',
        'Research & Analysis':       'Research',
        'Funding & Investment':      'Funding',
        'International Cooperation': 'International',
    };
    return map[policyType] ?? policyType;
}

// Left-border accent colour per type
const accentBar: Record<string, string> = {
    'Regulation & Compliance':   'bg-amber-400',
    'Strategy & Frameworks':     'bg-indigo-400',
    'Implementation Guidance':   'bg-cyan-400',
    'Research & Analysis':       'bg-purple-400',
    'Funding & Investment':      'bg-emerald-400',
    'International Cooperation': 'bg-blue-400',
};

// Friendly metadata keyed by the department CODE stored in the DB (p.dept).
// The matrix is built from real data, so anything not listed here still shows
// (with the code as its name) — but these give the known bodies proper labels.
const DEPT_META: Record<string, { name: string; role: string }> = {
    DSIT:           { name: 'Science, Innovation & Technology', role: 'AI strategy & policy' },
    ICO:            { name: "Information Commissioner's Office", role: 'Data protection & privacy' },
    CMA:            { name: 'Competition & Markets Authority', role: 'Competition oversight' },
    FCA:            { name: 'Financial Conduct Authority', role: 'Financial services' },
    DBT:            { name: 'Business & Trade', role: 'Business & trade' },
    Cabinet_Office: { name: 'Cabinet Office', role: 'Central government' },
    Home_Office:    { name: 'Home Office', role: 'Security & policing' },
    Treasury:       { name: 'HM Treasury', role: 'Economy & finance' },
    DHSC:           { name: 'Health & Social Care', role: 'Health & care' },
    DfE:            { name: 'Education', role: 'Education' },
};

const FILTERS = ['All', 'Regulation', 'Guidance', 'Strategy', 'Consultation', 'Research', 'Funding', 'International'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_TO_TYPE: Partial<Record<Filter, string>> = {
    Regulation:    'Regulation & Compliance',
    Guidance:      'Implementation Guidance',
    Strategy:      'Strategy & Frameworks',
    Research:      'Research & Analysis',
    Funding:       'Funding & Investment',
    International:  'International Cooperation',
};

function matchesFilter(p: Policy, filter: Filter): boolean {
    if (filter === 'All') return true;
    if (filter === 'Consultation') {
        // Consultation is a document type, not a policy_type. Match on the
        // same grouped categories the Explorer/Regulations filters use (open
        // and closed consultations + calls for evidence) — no title sniffing,
        // so consultation *responses* and outcomes don't false-match.
        const cat = documentTypeCategory(p.format);
        return cat === 'Open consultation' || cat === 'Closed consultation';
    }
    return p.policy_type === FILTER_TO_TYPE[filter];
}

// ── Main content ─────────────────────────────────────────────────────────────

export default function HomeContent({ initialPolicies }: { initialPolicies: Policy[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<Filter>('All');

    const policies = initialPolicies;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            window.location.href = `/policy-explorer?q=${encodeURIComponent(searchTerm)}`;
        }
    };

    const sorted = useMemo(
        () => [...policies].sort(
            (a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
        ),
        [policies]
    );

    // Feed respects the active hero filter
    const recentPolicies = useMemo(
        () => sorted.filter(p => matchesFilter(p, activeFilter)).slice(0, 5),
        [sorted, activeFilter]
    );

    // Key milestones: the most recent Regulation & Compliance entries, from real data
    const milestones = useMemo(
        () => sorted.filter(p => p.policy_type === 'Regulation & Compliance').slice(0, 4),
        [sorted]
    );

    // Departments/regulators built from the actual data, sorted by coverage.
    // Links carry the department CODE (p.dept), which is exactly what the
    // explorer's dept filter matches on.
    const regulators = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of policies) {
            if (p.dept) counts[p.dept] = (counts[p.dept] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([dept, count]) => ({
                dept,
                count,
                name: DEPT_META[dept]?.name ?? dept.replace(/_/g, ' '),
                role: DEPT_META[dept]?.role ?? 'Government department',
            }));
    }, [policies]);

    // Stats
    const totalPolicies   = policies.length;
    const totalReg        = policies.filter(p => p.policy_type === 'Regulation & Compliance').length;
    const recentThisMonth = policies.filter(p => withinDays(p.published_date, 31)).length;
    const totalDepts      = Array.from(new Set(policies.map(p => p.dept).filter(Boolean))).length;
    const activeRecent    = policies.filter(p => withinDays(p.published_date, 92)).length;

    return (
        <div className="bg-slate-50">

            {/* ── Hero: narrow, left-aligned, institutional ─────────────── */}
            <section className="bg-[#0F172A]">
                {/* Thin UK accent stripe */}
                <div className="h-[3px] bg-gradient-to-r from-[#012169] via-[#C8102E] to-[#012169]" />

                <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-10">
                    <div className="max-w-2xl">
                        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-snug mb-2">
                            Track every UK AI regulation, strategy and guidance update.
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 max-w-lg">
                            Verified against official UK government and regulator sources. Coverage from January 2025.
                        </p>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search regulations, strategies, guidance, departments…"
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#1E293B] border border-[#334155] rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors flex-shrink-0"
                            >
                                Search
                            </button>
                        </form>

                        {/* Quick filters — drive the Latest updates feed below */}
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map(f => (
                                <span key={f} className="flex items-center gap-2">
                                    {f === 'Consultation' && <span className="h-4 w-px bg-[#334155]" aria-hidden="true" />}
                                <button
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                                        activeFilter === f
                                            ? 'bg-primary-600 border-primary-600 text-white'
                                            : 'border-[#334155] text-slate-400 hover:border-slate-500 hover:text-slate-300 bg-transparent'
                                    }`}
                                >
                                    {f}
                                </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats band ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                        {[
                            { label: 'Policies tracked', value: totalPolicies, icon: FileText },
                            { label: 'Regulations', value: totalReg, icon: AlertCircle },
                            { label: 'New this month', value: recentThisMonth, icon: TrendingUp },
                            { label: 'Departments', value: totalDepts, icon: BookOpen },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="py-4 px-6 flex items-center gap-3">
                                <Icon className="w-4 h-4 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                                <div>
                                    <div className="text-xl font-semibold text-slate-900 nums-tabular leading-none">{value}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Departments & regulators — built from real data, linked by code */}
                <div className="mb-8">
                    <div className="flex items-baseline justify-between mb-3">
                        <span className="section-label">Departments &amp; regulators</span>
                        <span className="text-xs text-slate-400">{regulators.length} sources · click to filter</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {regulators.map(r => (
                            <Link
                                key={r.dept}
                                href={`/policy-explorer?dept=${encodeURIComponent(r.dept)}`}
                                className="card p-3 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 group-hover:bg-primary-100 border border-primary-100 rounded px-1.5 py-0.5 tracking-wide">
                                        {r.dept.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 nums-tabular">{r.count}</span>
                                </div>
                                <div className="text-[11px] font-medium text-slate-800 leading-tight mb-1">{r.name}</div>
                                <div className="text-[10px] text-slate-500 leading-tight">{r.role}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Two column: Feed + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Latest updates feed — 2/3 width */}
                    <div className="lg:col-span-2">
                        <div className="flex items-baseline justify-between mb-3">
                            <span className="section-label">
                                Latest updates{activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
                            </span>
                            <Link href="/policy-explorer" className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {recentPolicies.length === 0 ? (
                            <div className="card p-8 text-center text-sm text-slate-500">
                                No {activeFilter.toLowerCase()} entries found in the current feed.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentPolicies.map((policy) => (
                                    <div key={policy.url} className="card card-hover">
                                        <div className="flex">
                                            <div className={`w-0.5 ${accentBar[policy.policy_type] ?? 'bg-slate-300'} rounded-l-md flex-shrink-0`} />
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                                    <h3 className="text-[13px] font-medium text-slate-900 leading-snug">{policy.title}</h3>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0 nums-tabular mt-0.5">
                                                        {formatDate(policy.published_date)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                    <span className="text-xs font-medium text-primary-700">{policy.dept}</span>
                                                    {policy.policy_type && (
                                                        <>
                                                            <span className="text-slate-300 text-xs">·</span>
                                                            <span className={getBadgeClass(policy.policy_type)}>
                                                                {getBadgeLabel(policy.policy_type)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {policy.ai_summary && (
                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                        {policy.ai_summary}
                                                    </p>
                                                )}
                                                {policy.url && (
                                                    <a
                                                        href={policy.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 mt-2"
                                                    >
                                                        View source <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar — 1/3 width */}
                    <div className="space-y-4">

                        {/* Key milestones: latest real Regulation & Compliance entries */}
                        <div>
                            <div className="flex items-baseline justify-between mb-3">
                                <span className="section-label">Key milestones</span>
                                <span className="text-xs text-slate-400">Latest regulation</span>
                            </div>
                            <div className="card p-4">
                                <div className="relative">
                                    <div className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-200" />
                                    <div className="space-y-5">
                                        {milestones.map((m, i) => (
                                            <div key={m.url} className="flex gap-3 relative">
                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 relative z-10 ${
                                                    i === 0 ? 'bg-primary-500' :
                                                    i === 1 ? 'bg-slate-400' : 'bg-slate-200 border border-slate-300'
                                                }`} />
                                                <div>
                                                    <div className={`text-[10px] font-semibold tracking-wider uppercase mb-0.5 ${
                                                        i === 0 ? 'text-primary-600' : 'text-slate-400'
                                                    }`}>
                                                        {formatDate(m.published_date)} · {m.dept}
                                                    </div>
                                                    <a
                                                        href={m.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-medium text-slate-800 mb-0.5 leading-snug hover:text-primary-700 block"
                                                    >
                                                        {m.title}
                                                    </a>
                                                    {m.ai_summary && (
                                                        <div className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                            {m.ai_summary}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <Link href="/regulations" className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                                        View all regulations →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recently active count */}
                        <div className="card p-4">
                            <div className="section-label mb-3">Recently active</div>
                            <Link href="/regulations" className="flex items-center justify-between group">
                                <div>
                                    <div className="text-2xl font-semibold text-slate-900 nums-tabular leading-none mb-1">
                                        {activeRecent}
                                    </div>
                                    <div className="text-xs text-slate-500">Published in the last 3 months</div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                            </Link>
                        </div>

                        {/* Source authorities */}
                        <div className="card p-4">
                            <div className="section-label mb-3">Source authorities</div>
                            <div className="space-y-2">
                                {[
                                    { label: 'GOV.UK policy papers', href: 'https://www.gov.uk/search/policy-papers-and-consultations' },
                                    { label: 'ICO AI guidance hub', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/' },
                                    { label: 'CMA AI updates', href: 'https://www.gov.uk/cma-cases/ai-foundation-models-review' },
                                    { label: 'DSIT AI policy', href: 'https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology' },
                                ].map(link => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between text-xs text-slate-600 hover:text-primary-700 py-1 border-b border-slate-50 last:border-0 group"
                                    >
                                        {link.label}
                                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-primary-500 flex-shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
