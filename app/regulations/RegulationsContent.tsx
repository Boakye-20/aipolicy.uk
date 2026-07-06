'use client';

import { useState } from 'react';
import { Policy } from '@/types/policy';
import { formatDate } from '@/lib/utils';
import { Shield, Clock, ExternalLink, Building2 } from 'lucide-react';
import SourceEvidence from '@/components/SourceEvidence';
import { PolicyTypeBadge, NeutralBadge } from '@/components/Badges';

interface RegulationsContentProps {
    initialPolicies: Policy[];
}

export default function RegulationsContent({ initialPolicies }: RegulationsContentProps) {
    const [filterDept, setFilterDept] = useState('');
    const [filterSector, setFilterSector] = useState('');
    const [filterRecency, setFilterRecency] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    const getFilteredPolicies = () => {
        let filtered = [...initialPolicies];

        if (filterDept) filtered = filtered.filter(p => p.dept === filterDept);
        if (filterSector) filtered = filtered.filter(p => p.sector_focus === filterSector);
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
    const recencyOptions = ['Last month', 'Last 3 months', 'Last 6 months', 'Last year'];

    const recentRegulations = initialPolicies.filter(p =>
        p.recency === 'Last month' || p.recency === 'Last 3 months'
    ).length;

    return (
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Regulations monitor</h1>
                <p className="mt-1 text-sm text-slate-600">
                    AI compliance and regulatory requirements across UK government departments and regulators.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'AI regulations', value: initialPolicies.length, icon: Shield },
                    { label: 'Recent (3 months)', value: recentRegulations, icon: Clock },
                    { label: 'Departments', value: departments.length, icon: Building2 },
                ].map((s) => (
                    <div key={s.label} className="rounded-md border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-2 text-slate-500">
                            <s.icon className="h-4 w-4" />
                            <p className="text-sm font-medium">{s.label}</p>
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-slate-900 nums-tabular">{s.value}</p>
                    </div>
                ))}
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
                {(filterDept || filterSector || filterRecency || dateFrom || dateTo) && (
                    <button
                        onClick={() => { setFilterDept(''); setFilterSector(''); setFilterRecency(''); setDateFrom(''); setDateTo(''); }}
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

            <div className="space-y-4">
                {filteredPolicies.length === 0 ? (
                    <div className="rounded-md border border-slate-200 bg-white p-12 text-center">
                        <Shield className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                        <h3 className="mb-1 text-base font-semibold text-slate-900">No regulations found</h3>
                        <p className="text-sm text-slate-600">Try adjusting your filters.</p>
                    </div>
                ) : (
                    filteredPolicies.map((policy, index) => (
                        <article key={index} className="rounded-md border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="text-base font-semibold leading-snug text-slate-900">{policy.title}</h3>
                                <span className="whitespace-nowrap text-sm text-slate-500 nums-tabular">
                                    {formatDate(policy.published_date)}
                                </span>
                            </div>

                            <p className="mt-1 text-xs font-medium text-slate-500">{policy.dept}</p>

                            <p className="mt-3 text-sm leading-relaxed text-slate-700">{policy.ai_summary}</p>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                                <PolicyTypeBadge type={policy.policy_type} />
                                {policy.sector_focus && <NeutralBadge>{policy.sector_focus}</NeutralBadge>}
                            </div>

                            <SourceEvidence policy={policy} />

                            <div className="mt-4 flex items-center justify-end border-t border-slate-200 pt-4">
                                <a
                                    href={policy.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    View source <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
