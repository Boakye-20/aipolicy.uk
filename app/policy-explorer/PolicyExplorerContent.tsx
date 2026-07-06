'use client';

import { useState, useEffect } from 'react';
import { Policy } from '@/types/policy';
import { formatDate } from '@/lib/utils';
import { Search, Download, ExternalLink } from 'lucide-react';
import SourceEvidence from '@/components/SourceEvidence';
import { PolicyTypeBadge, NeutralBadge } from '@/components/Badges';

interface PolicyExplorerContentProps {
    initialPolicies: Policy[];
    initialSearch: string;
    initialDept: string;
}

export default function PolicyExplorerContent({ initialPolicies, initialSearch, initialDept }: PolicyExplorerContentProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [filters, setFilters] = useState({
        dept: initialDept,
        policyType: '',
        sector: '',
        aiApplication: '',
        dateFrom: '',
        dateTo: '',
    });
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const applyFilters = () => {
        let filtered = [...initialPolicies];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.title?.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term) ||
                p.ai_summary?.toLowerCase().includes(term) ||
                p.key_topics?.toLowerCase().includes(term)
            );
        }

        if (filters.dept) filtered = filtered.filter(p => p.dept === filters.dept);
        if (filters.policyType) filtered = filtered.filter(p => p.policy_type === filters.policyType);
        if (filters.sector) filtered = filtered.filter(p => p.sector_focus === filters.sector);
        if (filters.aiApplication) filtered = filtered.filter(p => p.ai_application === filters.aiApplication);
        if (filters.dateFrom) filtered = filtered.filter(p => new Date(p.published_date) >= new Date(filters.dateFrom));
        if (filters.dateTo) filtered = filtered.filter(p => new Date(p.published_date) <= new Date(filters.dateTo));

        filtered.sort((a, b) => {
            const aTime = new Date(a.published_date).getTime();
            const bTime = new Date(b.published_date).getTime();
            return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
        });

        return filtered;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ dept: '', policyType: '', sector: '', aiApplication: '', dateFrom: '', dateTo: '' });
    };

    const filteredPolicies = applyFilters();

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, sortOrder]);

    const exportResults = () => {
        if (filteredPolicies.length === 0) return;
        const csv = [
            Object.keys(filteredPolicies[0]).join(','),
            ...filteredPolicies.map(p => Object.values(p).map(v => `"${v}"`).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-policy-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const departments = [...new Set(initialPolicies.map(p => p.dept))].sort();
    const policyTypes = [...new Set(initialPolicies.map(p => p.policy_type))].sort();
    const sectors = [...new Set(initialPolicies.map(p => p.sector_focus))].sort();
    const aiApplications = [...new Set(initialPolicies.map(p => p.ai_application))].sort();

    const lastUpdated = (() => {
        const times = initialPolicies.map(p => new Date(p.published_date).getTime()).filter(t => !isNaN(t));
        return times.length ? formatDate(new Date(Math.max(...times)).toISOString()) : '';
    })();

    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPolicies = filteredPolicies.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Policy explorer</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Search and filter every tracked AI policy, regulation and guidance document.
                </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                        <input
                            type="text"
                            placeholder="Search by title, summary or topic…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={exportResults}
                        disabled={filteredPolicies.length === 0}
                        className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <select value={filters.dept} onChange={(e) => setFilters({ ...filters, dept: e.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="">All departments</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select value={filters.policyType} onChange={(e) => setFilters({ ...filters, policyType: e.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="">All types</option>
                    {policyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select value={filters.sector} onChange={(e) => setFilters({ ...filters, sector: e.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="">All sectors</option>
                    {sectors.map(sector => <option key={sector} value={sector}>{sector}</option>)}
                </select>
                <select value={filters.aiApplication} onChange={(e) => setFilters({ ...filters, aiApplication: e.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="">All applications</option>
                    {aiApplications.map(app => <option key={app} value={app}>{app}</option>)}
                </select>
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">Clear</button>
            </div>

            <p className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <span>
                    {filteredPolicies.length} {filteredPolicies.length === 1 ? 'policy' : 'policies'}
                    {searchTerm && ` · matching "${searchTerm}"`}
                </span>
                {lastUpdated && <span className="text-xs text-slate-400">Data current as of {lastUpdated}</span>}
            </p>

            <div className="space-y-4">
                {currentPolicies.length === 0 ? (
                    <div className="rounded-md border border-slate-200 bg-white p-12 text-center">
                        <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-base font-semibold text-slate-900 mb-1">No policies match your filters</h3>
                        <p className="text-sm text-slate-600 mb-4">Try removing a filter or broadening your search.</p>
                        <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Clear all filters</button>
                    </div>
                ) : currentPolicies.map((policy, index) => (
                    <article key={index} className="rounded-md border border-slate-300 bg-white p-6 transition-colors hover:border-slate-400">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-base font-semibold leading-snug text-slate-900">{policy.title}</h3>
                            <span className="whitespace-nowrap text-sm text-slate-500 nums-tabular">{formatDate(policy.published_date)}</span>
                        </div>

                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{policy.dept?.replace(/_/g, ' ')}</p>
                        <p className="mt-3 text-sm leading-relaxed text-slate-700">{policy.ai_summary}</p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                            <PolicyTypeBadge type={policy.policy_type} />
                            {policy.sector_focus && <NeutralBadge>{policy.sector_focus}</NeutralBadge>}
                        </div>

                        <SourceEvidence policy={policy} />

                        <div className="mt-4 flex items-center justify-end border-t border-slate-200 pt-4">
                            <a href={policy.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                View document <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </article>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                    <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
            )}
        </div>
    );
}
