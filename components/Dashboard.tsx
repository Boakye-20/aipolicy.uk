'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import { FileText, Shield, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import StatCard from './StatCard';
import PolicyTable from './PolicyTable';
import FilterBar from './FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const policyTypeColors = {
    'Regulation & Compliance': '#be123c', // rose-700
    'Strategy & Frameworks': '#2563eb', // blue-600
    'Implementation Guidance': '#059669', // emerald-600
    'Research & Analysis': '#475569', // slate-600
    'Funding & Investment': '#d97706', // amber-600
    'International Cooperation': '#5b21b6', // violet-700
    'Unknown': '#64748b' // slate-500
};

const CustomTooltip = ({ active, payload, totalPolicies = 0 }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-slate-200 rounded-md shadow-lg text-sm">
                <p className="font-bold text-slate-800">{data.name}</p>
                <p className="text-slate-600">{data.value} policies</p>
                {totalPolicies > 0 && (
                    <p className="text-xs text-slate-500">
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
    
    useEffect(() => {
        fetchPolicies();
    }, [selectedDept, selectedType]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <div className="text-center text-slate-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto"></div>
                    <p className="mt-4">Loading policies...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10">
                <Card className="max-w-md mx-auto bg-red-50 border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-800">Error Loading Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                        <button onClick={fetchPolicies} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            Retry
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Process data for charts and stats
    const totalPolicies = policies.length;
    const regulationCount = policies.filter(p => p.policy_type === 'Regulation & Compliance').length;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentCount = policies.filter(p => new Date(p.published_date) >= sixMonthsAgo).length;
    const strategicCount = policies.filter(p => ['Strategy & Frameworks', 'Implementation Guidance'].includes(p.policy_type)).length;

    const deptData = policies.reduce((acc, policy) => {
        const dept = policy.dept || 'Unknown';
        let item = acc.get(dept);
        if (!item) {
            item = { dept, total: 0, regulations: 0 };
        }
        item.total++;
        if (policy.policy_type === 'Regulation & Compliance') item.regulations++;
        acc.set(dept, item);
        return acc;
    }, new Map<string, { dept: string; total: number; regulations: number }>()).values();

    const policyTypeData = policies.reduce((acc, policy) => {
        const type = policy.policy_type || 'Unknown';
        let item = acc.get(type);
        if (!item) item = { name: type, value: 0 };
        item.value++;
        acc.set(type, item);
        return acc;
    }, new Map<string, { name: string; value: number }>()).values();
    
    const pieChartData = Array.from(policyTypeData).map(item => ({
        ...item,
        displayName: getShortLabel(item.name),
        color: policyTypeColors[item.name as keyof typeof policyTypeColors] || policyTypeColors['Unknown']
    })).sort((a,b) => b.value - a.value);

    const departments = ['', ...Array.from(new Set(policies.map(p => p.dept))).sort()];
    const policyTypes = ['', ...Array.from(new Set(policies.map(p => p.policy_type))).sort()];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <FilterBar
                departments={departments.slice(1)}
                policyTypes={policyTypes.slice(1)}
                selectedDept={selectedDept}
                selectedType={selectedType}
                onDeptChange={setSelectedDept}
                onTypeChange={setSelectedType}
                onReset={() => { setSelectedDept(''); setSelectedType(''); }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Policies" value={totalPolicies.toLocaleString()} icon={FileText} />
                <StatCard title="Regulations" value={regulationCount.toLocaleString()} icon={Shield} change={totalPolicies > 0 ? `${((regulationCount / totalPolicies) * 100).toFixed(0)}% of total` : ''} />
                <StatCard title="Recent (6 mo)" value={recentCount.toLocaleString()} icon={Calendar} change={totalPolicies > 0 ? `${((recentCount / totalPolicies) * 100).toFixed(0)}% of total` : ''} />
                <StatCard title="Strategic Docs" value={strategicCount.toLocaleString()} icon={TrendingUp} change={totalPolicies > 0 ? `${((strategicCount / totalPolicies) * 100).toFixed(0)}% of total` : ''} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Policies by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={Array.from(deptData).sort((a, b) => b.total - a.total)} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" />
                                <YAxis dataKey="dept" type="category" tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="total" name="Total Policies" fill="#0f172a" />
                                <Bar dataKey="regulations" name="Regulations" fill="#be123c" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Policy Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                             <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="displayName" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ displayName, percent }) => `${displayName} ${(percent * 100).toFixed(0)}%`}>
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip totalPolicies={totalPolicies} />} />
                                <Legend iconSize={10} formatter={(value, entry) => <span className="text-slate-600 text-sm">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Policy Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <PolicyTable policies={policies} />
                </CardContent>
            </Card>
        </div>
    );
}
