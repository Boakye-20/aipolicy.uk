'use client';

import { Policy } from '@/types/policy';
import { FileText, Shield, Calendar, TrendingUp } from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';

// Institutional palette for policy types (muted, semantic where it helps).
const TYPE_COLORS: Record<string, string> = {
    'Regulation & Compliance': '#dc2626',
    'Strategy & Frameworks': '#2563eb',
    'Research & Analysis': '#0891b2',
    'Implementation Guidance': '#7c3aed',
    'Funding & Investment': '#d97706',
    'International Cooperation': '#059669',
};
const SHORT: Record<string, string> = {
    'Regulation & Compliance': 'Regulation',
    'Strategy & Frameworks': 'Strategy',
    'Research & Analysis': 'Research',
    'Implementation Guidance': 'Implementation',
    'Funding & Investment': 'Funding',
    'International Cooperation': 'Intl. Coop',
};

function ChartTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
            <p className="font-medium text-slate-900">{p.name ?? p.dept}</p>
            <p className="text-slate-600 nums-tabular">{p.value ?? p.total} policies</p>
        </div>
    );
}

function Metric({ icon: Icon, label, value, sub }: {
    icon: any; label: string; value: number | string; sub?: string;
}) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900 nums-tabular">{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

export default function HomeMetrics({ policies }: { policies: Policy[] }) {
    const total = policies.length;
    const regulations = policies.filter(p => p.policy_type === 'Regulation & Compliance').length;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recent = policies.filter(p => new Date(p.published_date) >= sixMonthsAgo).length;
    const strategic = policies.filter(p =>
        p.policy_type === 'Strategy & Frameworks' || p.policy_type === 'Implementation Guidance'
    ).length;

    const deptData = Object.values(
        policies.reduce((acc: Record<string, { dept: string; total: number }>, p) => {
            const d = p.dept || 'Unknown';
            acc[d] = acc[d] || { dept: d, total: 0 };
            acc[d].total++;
            return acc;
        }, {})
    ).sort((a, b) => b.total - a.total);

    const typeData = Object.values(
        policies.reduce((acc: Record<string, { name: string; displayName: string; value: number }>, p) => {
            const t = p.policy_type || 'Unknown';
            acc[t] = acc[t] || { name: t, displayName: SHORT[t] || t, value: 0 };
            acc[t].value++;
            return acc;
        }, {})
    ).sort((a, b) => b.value - a.value);

    return (
        <div className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Overview</h2>

                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Metric icon={FileText} label="Total policies" value={total} />
                    <Metric icon={Shield} label="Regulations" value={regulations}
                        sub={total ? `${Math.round((regulations / total) * 100)}% of total` : undefined} />
                    <Metric icon={Calendar} label="Recent (6 months)" value={recent} />
                    <Metric icon={TrendingUp} label="Strategy & guidance" value={strategic} />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-white p-5">
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Policies by department</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deptData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis dataKey="dept" type="category" width={110} tick={{ fontSize: 12, fill: '#475569' }} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="total" fill="#1e293b" radius={[0, 3, 3, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="rounded-md border border-slate-200 bg-white p-5">
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Policy type distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="displayName"
                                    label={({ displayName, percent }: any) => `${displayName}: ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false} style={{ fontSize: 12 }}>
                                    {typeData.map((e) => (
                                        <Cell key={e.name} fill={TYPE_COLORS[e.name] || '#94a3b8'} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
