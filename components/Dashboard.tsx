'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import StatCard from './StatCard';
import { FileText, Shield, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PolicyTable from './PolicyTable';

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

// Get color based on policy type
const getColorForPolicyType = (type: string) => {
    switch (type) {
        case 'Regulation & Compliance': return '#dc2626';
        case 'Strategy & Frameworks': return '#0ea5e9';
        case 'Research & Analysis': return '#10b981';
        case 'Implementation Guidance': return '#8b5cf6';
        case 'Funding & Investment': return '#f59e0b';
        case 'International Cooperation': return '#ec4899';
        default: return '#9ca3af';
    }
};

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload, totalPolicies = 0 }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                <p className="font-medium">{data.name}</p>
                <p>{data.value} policies</p>
                {totalPolicies > 0 && (
                    <p className="text-sm text-gray-500">
                        {((data.value / totalPolicies) * 100).toFixed(1)}% of total
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDept, setSelectedDept] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    useEffect(() => {
        fetchPolicies();
    }, [selectedDept, selectedType]);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedDept) params.append('dept', selectedDept);
            if (selectedType) params.append('policyType', selectedType);

            const response = await fetch(`/api/policies?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch policies');

            const result = await response.json();
            setPolicies(result.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading policies...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchPolicies} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Calculate stats with the pre-filtered policies
    const totalPolicies = policies.length;
    const regulationCount = policies.filter(p => p.policy_type === 'Regulation & Compliance').length;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentCount = policies.filter(p => new Date(p.published_date) >= sixMonthsAgo).length;

    const strategicCount = policies.filter(p =>
        p.policy_type === 'Strategy & Frameworks' ||
        p.policy_type === 'Implementation Guidance'
    ).length;

    // Department data
    const deptData = policies.reduce((acc, policy) => {
        const dept = policy.dept || 'Unknown';
        const existing = acc.find(item => item.dept === dept);
        if (existing) {
            existing.total++;
            if (policy.policy_type === 'Regulation & Compliance') existing.regulations++;
        } else {
            acc.push({
                dept,
                total: 1,
                regulations: policy.policy_type === 'Regulation & Compliance' ? 1 : 0
            });
        }
        return acc;
    }, [] as Array<{ dept: string; total: number; regulations: number }>).sort((a, b) => b.total - a.total);

    // Policy type data with shortened labels
    const policyTypeData = policies.reduce((acc, policy) => {
        const type = policy.policy_type || 'Unknown';
        const existing = acc.find(item => item.name === type);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: type, value: 1 });
        }
        return acc;
    }, [] as Array<{ name: string; value: number }>).sort((a, b) => b.value - a.value);

    // Prepare data for policy type pie chart with shortened labels
    const pieChartData = policyTypeData.map(item => ({
        name: item.name,
        displayName: getShortLabel(item.name),
        value: item.value,
        color: getColorForPolicyType(item.name)
    }));

    const departments = ['', ...Array.from(new Set(policies.map(p => p.dept))).sort()];
    const policyTypes = ['', ...Array.from(new Set(policies.map(p => p.policy_type))).sort()];

    return (
        <div className="max-w-full">


            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Department
                            </label>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">All Departments</option>
                                {departments.slice(1).map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Policy Type
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">All Types</option>
                                {policyTypes.slice(1).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Policies"
                        value={totalPolicies}
                        icon={FileText}
                    />
                    <StatCard
                        title="Regulations"
                        value={regulationCount}
                        icon={Shield}
                        change={`${((regulationCount / totalPolicies) * 100).toFixed(0)}% of total`}
                    />
                    <StatCard
                        title="Recent (6 months)"
                        value={recentCount}
                        icon={Calendar}
                    />
                    <StatCard
                        title="Strategic Guidance"
                        value={strategicCount}
                        icon={TrendingUp}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Department Chart */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies by Department</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={deptData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="dept"
                                    type="category"
                                    width={120}
                                    tickFormatter={(value) => value}
                                />
                                <Tooltip />
                                <Bar dataKey="total" name="Total Policies" fill="#0ea5e9" />
                                <Bar dataKey="regulations" fill="#dc2626" name="Regulations" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Policy Type Chart */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Type Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart width={400} height={300}>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="displayName"
                                    label={({ displayName, percent }) => `${displayName}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip totalPolicies={totalPolicies} />} />
                                <Legend formatter={(value, entry: any, index) => entry.payload.payload.displayName} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Policy Table */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Policy Documents</h2>
                    <PolicyTable policies={policies} />
                </div>
            </div>
        </div>
    );
}
