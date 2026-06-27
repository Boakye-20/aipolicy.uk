'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import { formatDate } from '@/lib/utils';
import { Shield, Clock, ExternalLink, Filter, AlertCircle } from 'lucide-react';
import SourceEvidence from '@/components/SourceEvidence';

export default function RegulationsMonitor() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDept, setFilterDept] = useState('');
    const [filterSector, setFilterSector] = useState('');
    const [filterRecency, setFilterRecency] = useState('');

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            // Fetch only Regulation & Compliance policies - URL encode the space in the parameter
            const response = await fetch('/api/policies?policyType=Regulation%20%26%20Compliance');
            if (!response.ok) throw new Error('Failed to fetch regulations');
            const result = await response.json();

            console.log('Regulations API Response:', result); // Debug log
            console.log(`Loaded ${result.data?.length || 0} AI regulations`);

            if (result.data) {
                setPolicies(result.data);
            } else {
                console.error('No data in response:', result);
                setPolicies([]);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
            setPolicies([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredPolicies = () => {
        let filtered = [...policies];

        if (filterDept) {
            filtered = filtered.filter(p => p.dept === filterDept);
        }

        if (filterSector) {
            filtered = filtered.filter(p => p.sector_focus === filterSector);
        }

        if (filterRecency) {
            filtered = filtered.filter(p => p.recency === filterRecency);
        }

        // Sort by most recent first
        return filtered.sort((a, b) =>
            new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const filteredPolicies = getFilteredPolicies();
    const departments = [...new Set(policies.map(p => p.dept))].sort();
    const sectors = [...new Set(policies.map(p => p.sector_focus))].sort();
    const recencyOptions = ['Last month', 'Last 3 months', 'Last 6 months', 'Last year'];

    // Calculate quick stats
    const recentRegulations = policies.filter(p =>
        p.recency === 'Last month' || p.recency === 'Last 3 months'
    ).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center gap-4">
                    <Shield className="w-12 h-12" />
                    <div>
                        <h2 className="text-2xl font-bold">AI Regulations Monitor</h2>
                        <p className="text-red-100 mt-1">
                            Track mandatory AI compliance requirements across UK government departments
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">AI Regulations</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{policies.length}</p>
                        </div>
                        <Shield className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Recent (3 months)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{recentRegulations}</p>
                        </div>
                        <Clock className="w-12 h-12 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Departments</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{departments.length}</p>
                        </div>
                        <AlertCircle className="w-12 h-12 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Filter Regulations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                        <select
                            value={filterSector}
                            onChange={(e) => setFilterSector(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Sectors</option>
                            {sectors.map(sector => (
                                <option key={sector} value={sector}>{sector}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recency</label>
                        <select
                            value={filterRecency}
                            onChange={(e) => setFilterRecency(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Time</option>
                            {recencyOptions.map(recency => (
                                <option key={recency} value={recency}>{recency}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {(filterDept || filterSector || filterRecency) && (
                    <button
                        onClick={() => {
                            setFilterDept('');
                            setFilterSector('');
                            setFilterRecency('');
                        }}
                        className="mt-4 text-sm text-primary-600 hover:text-primary-700"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Results Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                    Showing <strong>{filteredPolicies.length}</strong> AI regulation{filteredPolicies.length !== 1 ? 's' : ''}
                    {filterDept && ` from ${filterDept}`}
                    {filterSector && ` in ${filterSector}`}
                    {filterRecency && ` published in ${filterRecency.toLowerCase()}`}
                </p>
            </div>

            {/* Regulation Cards */}
            <div className="space-y-4">
                {filteredPolicies.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Regulations Found</h3>
                        <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                    </div>
                ) : (
                    filteredPolicies.map((policy, index) => (
                        <div key={index} className="bg-white rounded-lg shadow border-l-4 border-red-500 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{policy.title}</h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-semibold border border-red-200">
                                                AI Regulation
                                            </span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                                {policy.dept}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                                {policy.sector_focus}
                                            </span>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                                                {policy.ai_application}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm text-gray-600">
                                        {formatDate(policy.published_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                                <p className="text-gray-700 text-sm">{policy.ai_summary}</p>
                            </div>

                            {policy.key_topics && (
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-700">Topics: </span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {policy.key_topics.split(',').slice(0, 5).map((topic, i) => (
                                            <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                                                {topic.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <SourceEvidence policy={policy} />

                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                                <div className="flex gap-4 text-sm text-gray-600">
                                    <span><strong>Impact:</strong> {policy.business_impact}</span>
                                    <span><strong>Stage:</strong> {policy.stage}</span>
                                </div>
                                <a
                                    href={policy.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                                >
                                    View Regulation <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
