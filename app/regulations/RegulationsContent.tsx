'use client';

import { useEffect, useMemo, useState } from 'react';
import { Policy } from '@/types/policy';
import { formatDate } from '@/lib/utils';
import { Shield, Clock, ExternalLink, Building2, X } from 'lucide-react';
import { PolicyTypeBadge, NeutralBadge, DocumentTypeBadge, StatusChip, documentTypeCategory, DOCUMENT_TYPE_CATEGORIES } from '@/components/Badges';

interface RegulationsContentProps {
    initialPolicies: Policy[];
}

export default function RegulationsContent({ initialPolicies }: RegulationsContentProps) {
    const [filterDept, setFilterDept] = useState('');
    const [filterSector, setFilterSector] = useState('');
    const [filterDocType, setFilterDocType] = useState('');
    const [filterRecency, setFilterRecency] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [selected, setSelected] = useState<Policy | null>(null);

    // Close the slide-over on Escape.
    useEffect(() => {
        if (!selected) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selected]);

    const getFilteredPolicies = () => {
        let filtered = [...initialPolicies];

        if (filterDept) filtered = filtered.filter(p => p.dept === filterDept);
        if (filterSector) filtered = filtered.filter(p => p.sector_focus === filterSector);
        if (filterDocType) filtered = filtered.filter(p => documentTypeCategory(p.format) === filterDocType);
        if (filterRecency) filtered = filtered.filter(p => p.recency === filterRecency);
        if (dateFrom) filtered = filtered.filter(p => new Date(p.published_date) >= new Date(dateFrom));
        if (dateTo) filtered = filtered.filter(p => new Date(p.published_date) <= new Date(dateTo));

        return filtered.sort((a, b) => {
            const aTime = new Date(a.published_date).getTime();
            const bTime = new Date(b.published_date).getTime();
            return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
        });
    };

    const filteredPolicies = getFilteredPolicies();
    const departments = [...new Set(initialPolicies.map(p => p.dept))].sort();
    const sectors = [...new Set(initialPolicies.map(p => p.sector_focus))].sort();
    const documentCategories = DOCUMENT_TYPE_CATEGORIES.filter(c => initialPolicies.some(p => documentTypeCategory(p.format) === c));
    const recencyOptions = ['Last month', 'Last 3 months', 'Last 6 months', 'Last year'];

    // Header intelligence — all computed from hard facts (dept, dates).
    const stats = useMemo(() => {
        const now = new Date();
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const newThisMonth = initialPolicies.filter(p => new Date(p.published_date) >= monthAgo).length;

        const quarterAgo = new Date(now);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        const recentQuarter = initialPolicies.filter(p => new Date(p.published_date) >= quarterAgo);

        const deptCounts = new Map<string, number>();
        recentQuarter.forEach(p => deptCounts.set(p.dept, (deptCounts.get(p.dept) || 0) + 1));
        const mostActive = [...deptCounts.entries()].sort((a, b) => b[1] - a[1])[0];

        return { newThisMonth, recentQuarter: recentQuarter.length, mostActive };
    }, [initialPolicies]);

    const recentChanges = useMemo(
        () =>
            [...initialPolicies]
                .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
                .slice(0, 5),
        [initialPolicies]
    );

    return (
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Regulations monitor</h1>
                <p className="mt-1 text-sm text-slate-600">
                    AI compliance and regulatory requirements across UK government departments and regulators.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                    Coverage begins 1 January 2025.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-md border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm font-medium">New this month</p>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 nums-tabular">{stats.newThisMonth}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm font-medium">Recent (3 months)</p>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 nums-tabular">{stats.recentQuarter}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Building2 className="h-4 w-4" />
                        <p className="text-sm font-medium">Most active (3 months)</p>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                        {stats.mostActive ? stats.mostActive[0].replace(/_/g, ' ') : '—'}
                        {stats.mostActive && <span className="ml-2 text-base font-medium text-slate-500 nums-tabular">{stats.mostActive[1]}</span>}
                    </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Shield className="h-4 w-4" />
                        <p className="text-sm font-medium">AI regulations</p>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 nums-tabular">{initialPolicies.length}</p>
                </div>
            </div>

            <div className="mb-8 rounded-md border border-slate-200 bg-white">
                <p className="border-b border-slate-200 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Recent changes
                </p>
                <ul className="divide-y divide-slate-100">
                    {recentChanges.map((policy) => (
                        <li key={policy.url}>
                            <button
                                onClick={() => setSelected(policy)}
                                className="flex w-full items-baseline gap-3 px-5 py-2.5 text-left hover:bg-slate-50"
                            >
                                <span className="whitespace-nowrap text-xs text-slate-500 nums-tabular">{formatDate(policy.published_date)}</span>
                                <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">{policy.dept?.replace(/_/g, ' ')}</span>
                                <span className="truncate text-sm text-slate-800">{policy.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value="">All departments</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value="">All sectors</option>
                    {sectors.map(sector => <option key={sector} value={sector}>{sector}</option>)}
                </select>
                <select
                    value={filterDocType}
                    onChange={(e) => setFilterDocType(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value="">All document types</option>
                    {documentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={filterRecency}
                    onChange={(e) => setFilterRecency(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value="">All time</option>
                    {recencyOptions.map(recency => <option key={recency} value={recency}>{recency}</option>)}
                </select>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Published from"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="Published to"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
                {(filterDept || filterSector || filterDocType || filterRecency || dateFrom || dateTo) && (
                    <button
                        onClick={() => { setFilterDept(''); setFilterSector(''); setFilterDocType(''); setFilterRecency(''); setDateFrom(''); setDateTo(''); }}
                        className="text-sm text-primary-600 hover:text-primary-700"
                    >
                        Clear
                    </button>
                )}
            </div>

            <p className="mb-6 text-sm text-slate-500">
                {filteredPolicies.length} regulation{filteredPolicies.length !== 1 ? 's' : ''}
                {filterDept && ` · ${filterDept}`}
                {filterSector && ` · ${filterSector}`}
                {filterRecency && ` · ${filterRecency.toLowerCase()}`}
            </p>

            {filteredPolicies.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-white p-12 text-center">
                    <Shield className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                    <h3 className="mb-1 text-base font-semibold text-slate-900">No regulations found</h3>
                    <p className="text-sm text-slate-600">Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3">Regulation</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Department</th>
                                <th className="hidden px-5 py-3 lg:table-cell">Sector</th>
                                <th className="px-5 py-3 text-right">Published</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredPolicies.map((policy) => (
                                <tr
                                    key={policy.url}
                                    onClick={() => setSelected(policy)}
                                    className={`cursor-pointer ${selected?.url === policy.url ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                                >
                                    <td className="max-w-md px-5 py-3 font-medium text-slate-900">
                                        <span className="line-clamp-2">{policy.title}</span>
                                    </td>
                                    <td className="px-5 py-3"><StatusChip format={policy.format} /></td>
                                    <td className="whitespace-nowrap px-5 py-3 text-slate-700">{policy.dept?.replace(/_/g, ' ')}</td>
                                    <td className="hidden whitespace-nowrap px-5 py-3 text-slate-700 lg:table-cell">{policy.sector_focus}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-right text-slate-500 nums-tabular">{formatDate(policy.published_date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-900/30"
                        onClick={() => setSelected(null)}
                        aria-hidden="true"
                    />
                    <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                {selected.dept?.replace(/_/g, ' ')} · {formatDate(selected.published_date)}
                            </p>
                            <button
                                onClick={() => setSelected(null)}
                                aria-label="Close panel"
                                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 px-6 py-5">
                            <h2 className="text-lg font-semibold leading-snug text-slate-900">{selected.title}</h2>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                <PolicyTypeBadge type={selected.policy_type} />
                                <DocumentTypeBadge format={selected.format} />
                                {selected.sector_focus && <NeutralBadge>{selected.sector_focus}</NeutralBadge>}
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-slate-700">{selected.ai_summary}</p>
                            {selected.source_quote && (
                                <figure className="mt-5 border-l-2 border-slate-300 pl-4">
                                    <figcaption className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        From the document
                                    </figcaption>
                                    <blockquote className="mt-1.5 text-sm italic leading-relaxed text-slate-600">
                                        &ldquo;{selected.source_quote}&rdquo;
                                    </blockquote>
                                </figure>
                            )}
                        </div>
                        <div className="flex items-center justify-end border-t border-slate-200 px-6 py-4">
                            <a
                                href={selected.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                View source <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
