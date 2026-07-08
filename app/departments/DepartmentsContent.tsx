'use client';

import { useState } from 'react';
import { Policy } from '@/types/policy';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, FileText, Shield, TrendingUp } from 'lucide-react';
import { documentTypeCategory } from '@/components/Badges';

interface DepartmentsContentProps {
    initialPolicies: Policy[];
}

const COLORS = ['#2563eb', '#0891b2', '#7c3aed', '#d97706', '#059669', '#64748b'];

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

const PolicyTypeTooltip = ({ active, payload, total = 0 }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                <p className="font-medium">{data.name}</p>
                <p>{data.value} policies</p>
                {total > 0 && <p className="text-sm text-gray-500">{((data.value / total) * 100).toFixed(1)}% of total</p>}
            </div>
        );
    }
    return null;
};

export default function DepartmentsContent({ initialPolicies }: DepartmentsContentProps) {
    const departments = [...new Set(initialPolicies.map(p => p.dept))].sort();
    const [selectedDept, setSelectedDept] = useState(departments[0] || '');

    const getDepartmentStats = () => {
        return departments.map(dept => {
            const deptPolicies = initialPolicies.filter(p => p.dept === dept);
            const regulations = deptPolicies.filter(p => p.policy_type === 'Regulation & Compliance').length;
            return {
                dept,
                total: deptPolicies.length,
                regulations,
                regulationPercent: ((regulations / deptPolicies.length) * 100).toFixed(0),
                percentage: ((deptPolicies.length / initialPolicies.length) * 100).toFixed(1)
            };
        }).sort((a, b) => b.total - a.total);
    };

    const getSelectedDeptData = () => {
        const deptPolicies = initialPolicies.filter(p => p.dept === selectedDept);

        const policyTypes = deptPolicies.reduce((acc, p) => {
            acc[p.policy_type] = (acc[p.policy_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const policyTypesWithShortNames = Object.entries(policyTypes).map(([name, value]) => ({
            name,
            displayName: getShortLabel(name),
            value,
            color: COLORS[Object.keys(policyTypes).indexOf(name) % COLORS.length]
        })).sort((a, b) => b.value - a.value);

        const timeline = deptPolicies.reduce((acc, p) => {
            const period = p.year_month;
            if (!acc[period]) acc[period] = 0;
            acc[period]++;
            return acc;
        }, {} as Record<string, number>);

        const sectors = deptPolicies.reduce((acc, p) => {
            acc[p.sector_focus] = (acc[p.sector_focus] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const docTypes = deptPolicies.reduce((acc, p) => {
            const label = documentTypeCategory(p.format);
            acc[label] = (acc[label] || 0) + 1;
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
            documentTypes: Object.entries(docTypes).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10),
        };
    };

    const deptStats = getDepartmentStats();
    const selectedData = getSelectedDeptData();

    return (
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">Department analysis</h1>

            <div className="rounded-md border border-slate-200 bg-white p-6 mb-8">
                <h2 className="mb-6 text-lg font-semibold text-slate-900">Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Total policies by department</h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={deptStats} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis dataKey="dept" type="category" width={110} tick={{ fontSize: 12, fill: '#475569' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="total" fill="#2563eb" name="Total" radius={[0, 3, 3, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <div className="mb-4 flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Regulation share by department</h3>
                            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">reg / total</span>
                        </div>
                        <div className="space-y-3">
                            {deptStats.map((stat, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-28 truncate text-sm font-medium text-slate-700">{stat.dept}</div>
                                    <div className="mx-3 flex-1">
                                        <div className="h-5 rounded bg-slate-100">
                                            <div className="flex h-5 items-center justify-end rounded bg-primary-500 pr-2" style={{ width: `${Math.max(Number(stat.regulationPercent), 6)}%` }}>
                                                <span className="text-xs font-medium text-white nums-tabular">{stat.regulationPercent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-16 text-right text-sm text-slate-500 nums-tabular">{stat.regulations}/{stat.total}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6 mb-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Detailed analysis</h2>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-64"
                    >
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total policies', value: selectedData.total, icon: FileText },
                        { label: 'Regulations', value: selectedData.regulations, icon: Shield },
                        { label: 'Recent (3m)', value: selectedData.recent, icon: TrendingUp },
                        { label: 'Sectors', value: selectedData.sectors.length, icon: Building2 },
                    ].map((s) => (
                        <div key={s.label} className="rounded-md border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <s.icon className="h-4 w-4" />
                                <p className="text-xs font-medium">{s.label}</p>
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-slate-900 nums-tabular">{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Policy types</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={selectedData.policyTypes} cx="50%" cy="50%" labelLine={false} label={({ displayName, percent }) => `${displayName}: ${(percent * 100).toFixed(0)}%`} outerRadius={90} dataKey="value" nameKey="displayName" style={{ fontSize: 12 }}>
                                    {selectedData.policyTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PolicyTypeTooltip total={selectedData.total} />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Publication timeline (last 12 months)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={selectedData.timeline} margin={{ bottom: 20 }}>
                                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} angle={-45} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Top 5 sectors</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={selectedData.sectors} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 12, fill: '#475569' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="value" fill="#2563eb" radius={[0, 3, 3, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Document types</h3>
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={selectedData.documentTypes} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fill: '#475569' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="value" fill="#2563eb" radius={[0, 3, 3, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
