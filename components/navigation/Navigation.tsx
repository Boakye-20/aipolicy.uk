'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Search,
    TrendingUp,
    Shield,
    Building2,
    Tag,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Explorer', href: '/policy-explorer', icon: Search },
    { name: 'Regulations', href: '/regulations', icon: Shield },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Topics', href: '/topics', icon: Tag },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}
