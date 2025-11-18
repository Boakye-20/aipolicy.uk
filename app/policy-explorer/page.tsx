'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import { formatDate } from '@/lib/utils';
import { Search, Filter, Download, ExternalLink } from 'lucide-react';

export default function PolicyExplorer() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        dept: '',
        policyType: '',
        sector: '',
        aiApplication: '',
        stage: '',
        dateFrom: '',
        dateTo: '',
    });
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchPolicies();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [policies, searchTerm, filters, sortOrder]);

    const fetchPolicies = async () => {
        try {
            const response = await fetch('/api/policies');
            const result = await response.json();

            // The API now returns only AI-relevant policies
            setPolicies(result.data);
            setFilteredPolicies(result.data);
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...policies];

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
        if (filters.stage) filtered = filtered.filter(p => p.stage === filters.stage);

        if (filters.dateFrom) {
            filtered = filtered.filter(p => new Date(p.published_date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            filtered = filtered.filter(p => new Date(p.published_date) <= new Date(filters.dateTo));
        }

        filtered.sort((a, b) => {
            const aTime = new Date(a.published_date).getTime();
            const bTime = new Date(b.published_date).getTime();
            if (sortOrder === 'newest') {
                return bTime - aTime;
            }
            return aTime - bTime;
        });

        setFilteredPolicies(filtered);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            dept: '',
            policyType: '',
            sector: '',
            aiApplication: '',
            stage: '',
            dateFrom: '',
            dateTo: '',
        });
    };

    const exportResults = () => {
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

    const getTypeColor = (type: string) => {
        if (type === 'Regulation & Compliance') return 'bg-red-100 text-red-800 border-red-200';
        if (type === 'Strategy & Frameworks') return 'bg-blue-100 text-blue-800 border-blue-200';
        if (type === 'Implementation Guidance') return 'bg-green-100 text-green-800 border-green-200';
        if (type === 'Research & Analysis') return 'bg-purple-100 text-purple-800 border-purple-200';
        if (type === 'Funding & Investment') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const departments = [...new Set(policies.map(p => p.dept))].sort();
    const policyTypes = [...new Set(policies.map(p => p.policy_type))].sort();
    const sectors = [...new Set(policies.map(p => p.sector_focus))].sort();
    const aiApplications = [...new Set(policies.map(p => p.ai_application))].sort();
    const stages = [...new Set(policies.map(p => p.stage).filter(Boolean))].sort();

    const getCurrentPolicies = () => filteredPolicies;
    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPolicies = getCurrentPolicies().slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search AI policies by title, description, summary, or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button
                        onClick={exportResults}
                        disabled={filteredPolicies.length === 0}
                        className="px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filter Options
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-700">Sort by</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="newest">Publication date: Newest first</option>
                                <option value="oldest">Publication date: Oldest first</option>
                            </select>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                            value={filters.dept}
                            onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type</label>
                        <select
                            value={filters.policyType}
                            onChange={(e) => setFilters({ ...filters, policyType: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All</option>
                            {policyTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                        <select
                            value={filters.sector}
                            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All</option>
                            {sectors.map(sector => (
                                <option key={sector} value={sector}>{sector}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">AI Application</label>
                        <select
                            value={filters.aiApplication}
                            onChange={(e) => setFilters({ ...filters, aiApplication: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All</option>
                            {aiApplications.map(app => (
                                <option key={app} value={app}>{app}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                        <select
                            value={filters.stage}
                            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All</option>
                            {stages.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1">
                    <p className="text-blue-800">
                        <span>Showing <strong>{filteredPolicies.length}</strong> {filteredPolicies.length === 1 ? 'policy' : 'policies'}</span>
                        {searchTerm && <span> matching "{searchTerm}"</span>}
                    </p>
                </div>
            </div>

            {/* Policy Cards */}
            <div className="space-y-4">
                {currentPolicies.map((policy, index) => (
                    <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{policy.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                        {policy.dept}
                                    </span>
                                    <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getTypeColor(policy.policy_type)}`}>
                                        {policy.policy_type}
                                    </span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                        {policy.ai_application}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right text-sm text-gray-500 ml-4">
                                <div className="font-medium">{formatDate(policy.published_date)}</div>
                                <div className="text-xs mt-1">{policy.recency}</div>
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-3">{policy.ai_summary}</p>

                        {policy.key_topics && (
                            <div className="mb-3">
                                <span className="text-sm font-medium text-gray-700">Topics: </span>
                                <span className="text-sm text-gray-600">{policy.key_topics}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span><strong>Sector:</strong> {policy.sector_focus}</span>
                                <span><strong>Stage:</strong> {policy.stage}</span>
                            </div>
                            <a
                                href={policy.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                                View Document <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
