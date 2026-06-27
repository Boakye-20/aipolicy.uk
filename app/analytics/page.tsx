'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Label, ReferenceLine, Cell, PieChart, Pie, Sector
} from 'recharts';
import { TrendingUp, FileText, Shield, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-900">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`tooltip-${index}`} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Color palette
const COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    gray: '#6b7280',
    dark: '#1f2937'
};

// Chart theme
const chartTheme = {
    colors: {
        text: '#374151',
        background: '#ffffff',
        grid: '#e5e7eb',
        border: '#d1d5db',
    },
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
};

// Helper functions
const formatYAxis = (tick: number) => {
    return tick === Math.floor(tick) ? tick.toString() : '';
};

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
        <g>
            <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#374151" style={{ fontWeight: 'bold' }}>
                {payload.name}
            </text>
            <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#374151">
                {value} policies
            </text>
            <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#374151">
                {`${(percent * 100).toFixed(1)}%`}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
        </g>
    );
};

const renderColorfulLegendText = (value: string) => {
    return <span style={{ color: '#374151' }}>{value}</span>;
};

const renderXAxisTick = ({ x, y, payload }: any) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-45)">
                {payload.value}
            </text>
        </g>
    );
};

const renderCustomBarLabel = ({ x, y, width, height, value }: any) => {
    return (
        <text
            x={x + width / 2}
            y={y - 5}
            fill="#666"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '0.75rem' }}
        >
            {value > 0 ? value : ''}
        </text>
    );
};

const renderCustomTooltip = (props: any) => {
    const { active, payload, label } = props;

    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-900 mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={`tooltip-item-${index}`} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm">
                                {entry.name}: <span className="font-medium">{entry.value}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

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

export default function Analytics() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const response = await fetch('/api/policies');
            if (!response.ok) throw new Error('Failed to fetch policies');
            const result = await response.json();
            setPolicies(result.data);
            console.log(`Loaded ${result.data.length} AI policies`); // Debug log
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    // Timeline data - publications over time with better date formatting
    const getTimelineData = () => {
        const grouped = policies.reduce((acc, policy) => {
            if (!policy.year_month) return acc;

            // Format date for better display (e.g., 'Jan 2023')
            const [year, month] = policy.year_month.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

            if (!acc[formattedDate]) {
                acc[formattedDate] = {
                    period: formattedDate,
                    date: date,
                    total: 0,
                    regulations: 0,
                    research: 0,
                    strategic: 0,
                    guidance: 0
                };
            }

            acc[formattedDate].total++;

            if (policy.policy_type === 'Regulation & Compliance') {
                acc[formattedDate].regulations++;
            } else if (policy.policy_type === 'Research & Analysis') {
                acc[formattedDate].research++;
            } else if (policy.policy_type === 'Strategy & Frameworks') {
                acc[formattedDate].strategic++;
            } else if (policy.policy_type === 'Implementation Guidance') {
                acc[formattedDate].guidance++;
            }

            return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped)
            .sort((a: any, b: any) => a.date - b.date)
            .slice(-18); // Last 18 months for better readability
    };

    // Policy types breakdown with better formatting and colors
    const getPolicyTypeBreakdown = () => {
        const typeData = policies.reduce((acc, policy) => {
            const type = policy.policy_type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Map to more readable names
        const nameMap: Record<string, string> = {
            'Regulation & Compliance': 'Regulation',
            'Strategy & Frameworks': 'Strategy',
            'Research & Analysis': 'Research',
            'Implementation Guidance': 'Guidance',
            'Funding & Investment': 'Funding',
            'International Cooperation': 'Intl. Coop'
        };

        // Color mapping for each policy type
        const colorMap: Record<string, string> = {
            'Regulation & Compliance': COLORS.danger,
            'Strategy & Frameworks': COLORS.primary,
            'Research & Analysis': COLORS.secondary,
            'Implementation Guidance': COLORS.info,
            'Funding & Investment': COLORS.warning,
            'International Cooperation': COLORS.purple
        };

        return Object.entries(typeData)
            .map(([name, value]) => ({
                name: nameMap[name] || name,
                value,
                originalName: name,
                color: colorMap[name] || COLORS.gray
            }))
            .sort((a, b) => b.value - a.value);
    };

    // Department activity over time with better formatting
    const getDepartmentActivity = () => {
        // Get top 5 most active departments
        const deptActivity = policies.reduce((acc, policy) => {
            acc[policy.dept] = (acc[policy.dept] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topDepts = Object.entries(deptActivity)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([dept]) => dept);

        // Group by month for the last 12 months
        const last12Months = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            return date.toISOString().slice(0, 7); // YYYY-MM format
        });

        return last12Months.map(month => {
            const periodData: any = {
                period: new Date(month + '-01').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                })
            };

            topDepts.forEach(dept => {
                periodData[dept] = policies.filter(p =>
                    p.year_month === month && p.dept === dept
                ).length;
            });

            return periodData;
        });
    };

    // Sector trends with better formatting
    const getSectorTrends = () => {
        const sectorData = policies.reduce((acc, policy) => {
            const sector = policy.sector_focus || 'Other';
            acc[sector] = (acc[sector] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Sort and take top 8 sectors, group the rest as 'Other'
        const sortedSectors = Object.entries(sectorData)
            .sort((a, b) => b[1] - a[1]);

        const topSectors = sortedSectors.slice(0, 7);
        const otherCount = sortedSectors.slice(7).reduce((sum, [_, count]) => sum + count, 0);

        const result = topSectors.map(([sector, count]) => ({
            sector: sector.length > 20 ? `${sector.substring(0, 20)}...` : sector,
            count,
            fullName: sector
        }));

        if (otherCount > 0) {
            result.push({
                sector: 'Other',
                count: otherCount,
                fullName: 'Other sectors'
            });
        }

        return result;
    };

    // Regulations by sector with better formatting
    const getRegulationsBySector = () => {
        const regulations = policies.filter(p => p.policy_type === 'Regulation & Compliance');
        const sectorData = regulations.reduce((acc, policy) => {
            const sector = policy.sector_focus || 'Other';
            acc[sector] = (acc[sector] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Sort and take top 7 sectors, group the rest as 'Other'
        const sortedSectors = Object.entries(sectorData)
            .sort((a, b) => b[1] - a[1]);

        const topSectors = sortedSectors.slice(0, 6);
        const otherCount = sortedSectors.slice(6).reduce((sum, [_, count]) => sum + count, 0);

        const result = topSectors.map(([sector, count]) => ({
            sector: sector.length > 20 ? `${sector.substring(0, 20)}...` : sector,
            count,
            fullName: sector
        }));

        if (otherCount > 0) {
            result.push({
                sector: 'Other',
                count: otherCount,
                fullName: 'Other sectors'
            });
        }

        return result;
    };

    // Calculate trends with more context
    const calculateTrend = () => {
        const timeline = getTimelineData();
        if (timeline.length < 2) return {
            direction: 'stable',
            percentage: 0,
            recentCount: 0,
            previousCount: 0,
            period: '3 months'
        };

        const recent = timeline.slice(-3).reduce((sum: number, item: any) => sum + item.total, 0);
        const previous = timeline.slice(-6, -3).reduce((sum: number, item: any) => sum + item.total, 0);

        if (previous === 0) return {
            direction: 'up',
            percentage: 100,
            recentCount: recent,
            previousCount: 0,
            period: '3 months'
        };

        const change = ((recent - previous) / previous) * 100;

        return {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
            percentage: Math.abs(Math.round(change * 10) / 10), // 1 decimal place
            recentCount: recent,
            previousCount: previous,
            period: '3 months'
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const timelineData = getTimelineData();
    const policyTypeBreakdown = getPolicyTypeBreakdown();
    const departmentActivity = getDepartmentActivity();
    const sectorTrends = getSectorTrends();
    const regulationsBySector = getRegulationsBySector();
    const trend = calculateTrend();

    const regulationsCount = policies.filter(p => p.policy_type === 'Regulation & Compliance').length;
    const regulationsPercent = ((regulationsCount / policies.length) * 100).toFixed(1);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
                <p className="mt-2 text-gray-600">Comprehensive analysis of AI policy trends and metrics</p>
            </div>

            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center text-gray-600 mb-2">
                                <Activity className="w-5 h-5 mr-2" />
                                <span className="text-sm font-medium">Publication Trend</span>
                            </div>
                            <div className="flex items-baseline">
                                <p className="text-3xl font-bold text-gray-900">
                                    {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '−' : ''}{trend.percentage}%
                                </p>
                                <span className="ml-2 text-sm text-gray-500">vs previous period</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {trend.recentCount} policies in last {trend.period} • {trend.direction === 'up' ? '↑' : '↓'} from {trend.previousCount} before
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${trend.direction === 'up' ? 'bg-green-50 text-green-600' :
                            trend.direction === 'down' ? 'bg-red-50 text-red-600' :
                                'bg-blue-50 text-blue-600'
                            }`}>
                            <TrendingUp className={`w-6 h-6 ${trend.direction === 'down' ? 'transform rotate-180' : ''
                                }`} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center text-gray-600 mb-2">
                                <Shield className="w-5 h-5 mr-2" />
                                <span className="text-sm font-medium">Regulatory Activity</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{regulationsCount}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {regulationsPercent}% of all policies • {policies.filter(p => p.policy_type === 'Regulation & Compliance' &&
                                    new Date(p.published_date) >= new Date(new Date().setMonth(new Date().getMonth() - 6))).length} in last 6 months
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50 text-red-600">
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center text-gray-600 mb-2">
                                <BarChart2 className="w-5 h-5 mr-2" />
                                <span className="text-sm font-medium">Policy Distribution</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {policyTypeBreakdown[0]?.value || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {policyTypeBreakdown[0]?.name || 'N/A'} policies • {policies.length} total
                            </p>
                            <div className="mt-2 flex -space-x-1">
                                {policyTypeBreakdown.slice(0, 5).map((item, index) => (
                                    <div
                                        key={index}
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${(item.value / Math.max(...policyTypeBreakdown.map(p => p.value))) * 100}%`,
                                            backgroundColor: item.color || COLORS.gray,
                                            marginRight: '2px'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                            <PieChartIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Publications Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Publications Over Time</h3>
                        <p className="text-sm text-gray-500">Number of policies published by type (last 18 months)</p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex space-x-2">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Regulations</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Strategic</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Research</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-cyan-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Guidance</span>
                        </div>
                    </div>
                </div>

                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={timelineData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                        >
                            <defs>
                                <linearGradient id="colorRegulations" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorStrategic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorResearch" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorGuidance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e5e7eb"
                            />
                            <XAxis
                                dataKey="period"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickMargin={10}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatYAxis}
                                width={30}
                            />
                            <Tooltip
                                content={renderCustomTooltip}
                                cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="regulations"
                                name="Regulations"
                                stackId="1"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorRegulations)"
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="strategic"
                                name="Strategic"
                                stackId="1"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorStrategic)"
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="research"
                                name="Research"
                                stackId="1"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorResearch)"
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="guidance"
                                name="Guidance"
                                stackId="1"
                                stroke="#06b6d4"
                                fillOpacity={1}
                                fill="url(#colorGuidance)"
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-xs text-gray-500 text-right mt-2">
                    Hover over the chart for detailed information
                </div>
            </div>

            {/* Policy Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Policy Type Distribution</h3>
                        <p className="text-sm text-gray-500">Breakdown of policies by their primary type</p>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={policyTypeBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {policyTypeBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={renderCustomTooltip}
                                    formatter={(value: number, name: string, props: any) => [
                                        value,
                                        props.payload.originalName || name
                                    ]}
                                />
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    formatter={renderColorfulLegendText}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Top Sectors by Policy Count</h3>
                        <p className="text-sm text-gray-500">Most active sectors in AI policy development</p>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sectorTrends}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    horizontal={true}
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    dataKey="sector"
                                    type="category"
                                    width={120}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    content={({ active, payload, label }: any) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <p className="font-semibold">{data.fullName || data.sector}</p>
                                                    <p className="text-sm">{payload[0].value} policies</p>
                                                    <p className="text-xs text-gray-500">
                                                        {((data.count / policies.length) * 100).toFixed(1)}% of total
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Policies"
                                    radius={[0, 4, 4, 0]}
                                >
                                    {sectorTrends.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`hsl(${index * 40}, 70%, 60%)`}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Department Activity & Regulations by Sector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Department Activity</h3>
                        <p className="text-sm text-gray-500">Policies published by top departments (last 12 months)</p>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={departmentActivity}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickMargin={10}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatYAxis}
                                    width={30}
                                />
                                <Tooltip
                                    content={renderCustomTooltip}
                                    cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="top"
                                    align="center"
                                    height={40}
                                    formatter={renderColorfulLegendText}
                                />
                                {departmentActivity.length > 0 &&
                                    Object.keys(departmentActivity[0])
                                        .filter(key => key !== 'period')
                                        .map((dept, index) => (
                                            <Line
                                                key={dept}
                                                type="monotone"
                                                dataKey={dept}
                                                stroke={`hsl(${index * 60}, 70%, 50%)`}
                                                strokeWidth={2}
                                                dot={{ r: 2 }}
                                                activeDot={{ r: 5, strokeWidth: 0 }}
                                                name={dept}
                                            />
                                        ))
                                }
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Regulations by Sector</h3>
                        <p className="text-sm text-gray-500">Sectors with the most regulatory activity</p>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={regulationsBySector}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    horizontal={true}
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    dataKey="sector"
                                    type="category"
                                    width={120}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    content={({ active, payload, label }: any) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <p className="font-semibold">{data.fullName || data.sector}</p>
                                                    <p className="text-sm">{payload[0].value} regulations</p>
                                                    <p className="text-xs text-gray-500">
                                                        {((data.count / regulationsCount) * 100).toFixed(1)}% of all regulations
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Regulations"
                                    radius={[0, 4, 4, 0]}
                                    fill="#ef4444"
                                >
                                    {regulationsBySector.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`rgba(239, 68, 68, ${0.6 + (index * 0.08)})`}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                                <div className={`w-2 h-2 rounded-full ${trend.direction === 'up' ? 'bg-green-500' :
                                    trend.direction === 'down' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Publication Trend</p>
                                <p className="text-sm text-gray-600">
                                    Activity has {trend.direction === 'up' ? 'increased' : trend.direction === 'down' ? 'decreased' : 'remained stable'} by {trend.percentage}% in the last {trend.period}.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Regulatory Focus</p>
                                <p className="text-sm text-gray-600">
                                    {regulationsCount} regulatory documents account for {regulationsPercent}% of all policies in the database.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Sector Coverage</p>
                                <p className="text-sm text-gray-600">
                                    {sectorTrends[0]?.fullName || sectorTrends[0]?.sector || 'N/A'} is the most covered sector with {sectorTrends[0]?.count || 0} policies.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Recent Activity</p>
                                <p className="text-sm text-gray-600">
                                    {policies.filter(p => new Date(p.published_date) >= new Date(new Date().setMonth(new Date().getMonth() - 6))).length} policies
                                    published in the last 6 months.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                    <p className="text-xs text-gray-500 text-center">
                        Last updated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}
