'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2, FileText, Shield, TrendingUp } from 'lucide-react';

// Helper function to get shortened labels for display
const getShortLabel = (fullName: string) => {
    const nameMap: Record<string, string> = {
        'Regulation & Compliance': 'Regulation',
        'Strategy & Frameworks': 'Strategy',
        'Research & Analysis': 'Research',
        'Implementation Guidance': 'Implementation',
        'Funding & Investment': 'Funding',
        'International Cooperation': 'Intl. Coop'
    };
    return nameMap[fullName] || fullName;
};

// Custom tooltip for policy types
const PolicyTypeTooltip = ({ active, payload, total = 0 }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                <p className="font-medium">{data.name}</p>
                <p>{data.value} policies</p>
                {total > 0 && (
                    <p className="text-sm text-gray-500">
                        {((data.value / total) * 100).toFixed(1)}% of total
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export default function DepartmentAnalysis() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const response = await fetch('/api/policies');
            if (!response.ok) throw new Error('Failed to fetch policies');
            const result = await response.json();
            setPolicies(result.data);
            console.log(`Loaded ${result.data.length} AI policies for department analysis`); // Debug log
            if (result.data.length > 0) {
                const firstDept = [...new Set(result.data.map((p: Policy) => p.dept))].sort()[0] as string;
                setSelectedDept(firstDept);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const departments = [...new Set(policies.map(p => p.dept))].sort();

    // Department overview stats
    const getDepartmentStats = () => {
        return departments.map(dept => {
            const deptPolicies = policies.filter(p => p.dept === dept);
            const regulations = deptPolicies.filter(p => p.policy_type === 'Regulation & Compliance').length;

            return {
                dept,
                total: deptPolicies.length,
                regulations,
                regulationPercent: ((regulations / deptPolicies.length) * 100).toFixed(0),
                percentage: ((deptPolicies.length / policies.length) * 100).toFixed(1)
            };
        }).sort((a, b) => b.total - a.total);
    };

    // Selected department deep dive
    const getSelectedDeptData = () => {
        const deptPolicies = policies.filter(p => p.dept === selectedDept);

        // Policy types
        const policyTypes = deptPolicies.reduce((acc, p) => {
            acc[p.policy_type] = (acc[p.policy_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Add shortened labels for display
        const policyTypesWithShortNames = Object.entries(policyTypes).map(([name, value]) => ({
            name,
            displayName: getShortLabel(name),
            value,
            color: COLORS[Object.keys(policyTypes).indexOf(name) % COLORS.length]
        })).sort((a, b) => b.value - a.value);

        // Timeline
        const timeline = deptPolicies.reduce((acc, p) => {
            const period = p.year_month;
            if (!acc[period]) acc[period] = 0;
            acc[period]++;
            return acc;
        }, {} as Record<string, number>);

        // Sectors
        const sectors = deptPolicies.reduce((acc, p) => {
            acc[p.sector_focus] = (acc[p.sector_focus] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // AI Applications
        const applications = deptPolicies.reduce((acc, p) => {
            acc[p.ai_application] = (acc[p.ai_application] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const regulations = deptPolicies.filter(p => p.policy_type === 'Regulation & Compliance').length;
        const recent = deptPolicies.filter(p => p.recency === 'Last month' || p.recency === 'Last 3 months').length;

        return {
            total: deptPolicies.length,
            regulations,
            recent,
            policyTypes: policyTypesWithShortNames,
            timeline: Object.entries(timeline).map(([period, count]) => ({ period, count })).sort((a, b) => a.period.localeCompare(b.period)).slice(-12),
            sectors: Object.entries(sectors).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
            applications: Object.entries(applications).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
        };
    };

    const COLORS = ['#dc2626', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const deptStats = getDepartmentStats();
    const selectedData = getSelectedDeptData();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Department Overview */}
            <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Building2 className="w-7 h-7 text-primary-600" />
                    Department Overview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Policies by Department</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deptStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dept" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#0ea5e9" name="Total Policies" />
                                <Bar dataKey="regulations" fill="#dc2626" name="Regulations" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulation Percentage by Department</h3>
                        <div className="space-y-3">
                            {deptStats.map((stat, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-32 text-sm font-medium text-gray-700 truncate">{stat.dept}</div>
                                    <div className="flex-1 mx-3">
                                        <div className="bg-gray-200 rounded-full h-6">
                                            <div
                                                className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                                                style={{ width: `${stat.regulationPercent}%` }}
                                            >
                                                <span className="text-white text-xs font-semibold">{stat.regulationPercent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-20 text-sm text-gray-600 text-right">
                                        {stat.regulations}/{stat.total}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Selector */}
            <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Department Analysis</h2>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* Selected Department Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <FileText className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{selectedData.total}</p>
                        <p className="text-sm text-blue-700">Total Policies</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <Shield className="w-8 h-8 text-red-600 mb-2" />
                        <p className="text-2xl font-bold text-red-900">{selectedData.regulations}</p>
                        <p className="text-sm text-red-700">Regulations</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                        <p className="text-2xl font-bold text-green-900">{selectedData.recent}</p>
                        <p className="text-sm text-green-700">Recent (3m)</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <Building2 className="w-8 h-8 text-purple-600 mb-2" />
                        <p className="text-2xl font-bold text-purple-900">{selectedData.sectors.length}</p>
                        <p className="text-sm text-purple-700">Sectors</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Policy Types */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Types</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={selectedData.policyTypes}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ displayName, percent }) => `${displayName}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="displayName"
                                >
                                    {selectedData.policyTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PolicyTypeTooltip total={selectedData.total} />} />
                                <Legend
                                    formatter={(value, entry: any, index) =>
                                        selectedData.policyTypes[index]?.displayName || value
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Timeline (Last 12 Months)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={selectedData.timeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Sectors */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Sectors</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={selectedData.sectors} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* AI Applications */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Applications</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={selectedData.applications}
                                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-30}
                                    textAnchor="end"
                                    height={130}
                                    tick={{ fontSize: 16 }}
                                    interval={0}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8b5cf6" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
