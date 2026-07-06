'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
    title: React.ReactNode;
    value: string | number;
    icon: LucideIcon;
    change?: string;
}

export default function StatCard({ title, value, icon: Icon, change }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                {change && (
                    <p className="text-xs text-slate-500 pt-1">{change}</p>
                )}
            </CardContent>
        </Card>
    );
}
